#!/usr/bin/env python3

import os
import re
import glob
import shutil
import sys
from pathlib import Path

# Configuration
SOURCE_DIR = "FlexPrice Documentation/Documentation 1b09b3a59a6880469579dbc99ca2f788"
TARGET_DIR = "docs"
IMAGE_DIR = "public/images"

def ensure_dir(directory):
    """Ensure that a directory exists."""
    os.makedirs(directory, exist_ok=True)

def clean_filename(filename):
    """Clean up filenames to be more URL-friendly."""
    # Remove the Notion ID from the filename
    pattern = r'(.*?)\s+[0-9a-f]{32}'
    match = re.match(pattern, filename)
    if match:
        return match.group(1).strip()
    return filename

def get_title_from_content(content):
    """Extract title from markdown content."""
    # Look for the first heading
    match = re.search(r'^#\s+(.*?)$', content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return None

def convert_asides_to_callouts(content):
    """Convert Notion asides to MDX Callout components."""
    # Pattern to match Notion asides
    aside_pattern = re.compile(r'<aside>\s*(.*?)\s*</aside>', re.DOTALL)
    
    def replace_aside(match):
        aside_content = match.group(1)
        # Extract the image if present
        img_match = re.search(r'<img src="(.*?)".*?/>', aside_content)
        img_tag = ""
        if img_match:
            img_src = img_match.group(1)
            img_tag = f'<img src="{img_src}" width="40px" />\n\n'
            # Remove the img tag from the content
            aside_content = re.sub(r'<img src=".*?"/>', '', aside_content)
        
        # Format the content for a Callout
        return f'<Callout>\n{img_tag}{aside_content.strip()}\n</Callout>'
    
    # Replace all asides with Callouts
    return aside_pattern.sub(replace_aside, content)

def fix_image_paths(content, rel_path):
    """Update image paths to point to the correct location."""
    # Pattern to match image references
    img_pattern = re.compile(r'!\[(.*?)\]\((.*?)\)')
    
    def replace_image(match):
        alt_text = match.group(1)
        img_path = match.group(2)
        
        # If it's a relative path, update it to point to the image directory
        if not img_path.startswith(('http://', 'https://')):
            # Extract the filename from the path
            img_filename = os.path.basename(img_path)
            # Create the new path
            new_path = f'/images/{rel_path}/{img_filename}'
            return f'![{alt_text}]({new_path})'
        
        return match.group(0)
    
    # Replace all image references
    return img_pattern.sub(replace_image, content)

def fix_internal_links(content, current_path, file_mapping):
    """Update internal links to use the correct paths."""
    # Pattern to match markdown links
    link_pattern = re.compile(r'\[(.*?)\]\((.*?)\)')
    
    def replace_link(match):
        link_text = match.group(1)
        link_path = match.group(2)
        
        # If it's not an external link
        if not link_path.startswith(('http://', 'https://', '#', '/')):
            # Get the absolute path of the linked file
            abs_link_path = os.path.normpath(os.path.join(os.path.dirname(current_path), link_path))
            
            # If the linked file is in our mapping, update the link
            if abs_link_path in file_mapping:
                new_path = file_mapping[abs_link_path]
                return f'[{link_text}]({new_path})'
        
        return match.group(0)
    
    # Replace all links
    return link_pattern.sub(replace_link, content)

def add_frontmatter(content, title, rel_path):
    """Add frontmatter to the MDX file."""
    # Check if the content already has frontmatter
    if content.startswith('---'):
        return content
    
    # If no title was provided, try to extract it from the content
    if not title:
        title = get_title_from_content(content)
    
    # If still no title, use the filename
    if not title:
        title = os.path.basename(rel_path)
    
    # Create frontmatter
    frontmatter = f'---\ntitle: "{title}"\ndescription: "Flexprice documentation"\n---\n\n'
    
    # Add import for Callout if needed
    if '<Callout>' in content:
        frontmatter = f'---\ntitle: "{title}"\ndescription: "Flexprice documentation"\n---\n\nimport {{ Callout }} from \'/callouts/callout\'\n\n'
    
    return frontmatter + content

def process_file(file_path, rel_path, file_mapping):
    """Process a single markdown file and convert it to MDX."""
    # Read the content of the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract title from the first heading
    title = get_title_from_content(content)
    
    # Convert Notion asides to MDX Callout components
    content = convert_asides_to_callouts(content)
    
    # Fix image paths
    content = fix_image_paths(content, rel_path)
    
    # Fix internal links
    content = fix_internal_links(content, file_path, file_mapping)
    
    # Add frontmatter
    content = add_frontmatter(content, title, rel_path)
    
    return content

def copy_images(source_dir, target_dir):
    """Copy all images from the source directory to the target directory."""
    # Find all image files
    image_files = []
    for ext in ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg']:
        image_files.extend(glob.glob(f"{source_dir}/**/{ext}", recursive=True))
    
    # Copy each image to the target directory
    for img_path in image_files:
        # Get the relative path from the source directory
        rel_path = os.path.relpath(img_path, source_dir)
        # Create the target directory if it doesn't exist
        target_path = os.path.join(target_dir, rel_path)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        # Copy the image
        shutil.copy2(img_path, target_path)
        print(f"Copied image: {rel_path}")

def main():
    # Ensure target directories exist
    ensure_dir(TARGET_DIR)
    ensure_dir(IMAGE_DIR)
    
    # Create a mapping of source files to target files
    file_mapping = {}
    
    # Find all markdown files
    md_files = glob.glob(f"{SOURCE_DIR}/**/*.md", recursive=True)
    
    # First pass: create the mapping
    for file_path in md_files:
        # Get the relative path from the source directory
        rel_path = os.path.relpath(file_path, SOURCE_DIR)
        # Clean up the filename
        clean_path = os.path.join(os.path.dirname(rel_path), clean_filename(os.path.basename(rel_path)))
        # Change the extension to .mdx
        mdx_path = os.path.splitext(clean_path)[0] + '.mdx'
        # Add to the mapping
        file_mapping[file_path] = '/' + mdx_path.replace('\\', '/')
    
    # Second pass: process each file
    for file_path in md_files:
        # Get the relative path from the source directory
        rel_path = os.path.relpath(file_path, SOURCE_DIR)
        # Clean up the filename
        clean_path = os.path.join(os.path.dirname(rel_path), clean_filename(os.path.basename(rel_path)))
        # Change the extension to .mdx
        mdx_path = os.path.splitext(clean_path)[0] + '.mdx'
        # Create the target path
        target_path = os.path.join(TARGET_DIR, mdx_path)
        # Create the target directory if it doesn't exist
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        
        # Process the file
        content = process_file(file_path, rel_path, file_mapping)
        
        # Write the processed content to the target file
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Processed: {rel_path} -> {mdx_path}")
    
    # Copy images
    image_target_dir = os.path.join(IMAGE_DIR, os.path.basename(TARGET_DIR))
    copy_images(SOURCE_DIR, image_target_dir)
    
    print(f"\nConversion complete! {len(md_files)} files processed.")
    print(f"MDX files are in the '{TARGET_DIR}' directory.")
    print(f"Images are in the '{image_target_dir}' directory.")

if __name__ == "__main__":
    main() 