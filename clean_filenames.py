#!/usr/bin/env python3

import os
import re
import glob
import shutil
from pathlib import Path

# Configuration
DOCS_DIR = "docs"
IMAGES_DIR = "public/images/docs"

def clean_filename(filename):
    """Clean up filenames to be more URL-friendly."""
    # Remove the Notion ID from the filename
    pattern = r'(.*?)\s+[0-9a-f]{32}'
    match = re.match(pattern, filename)
    if match:
        return match.group(1).strip()
    return filename

def rename_files_and_directories(base_dir):
    """Rename files and directories to remove Notion IDs."""
    # First, collect all paths to rename
    paths_to_rename = []
    
    # Walk through the directory tree bottom-up
    for root, dirs, files in os.walk(base_dir, topdown=False):
        # Add directories to the list
        for dir_name in dirs:
            old_path = os.path.join(root, dir_name)
            new_name = clean_filename(dir_name)
            if new_name != dir_name:
                new_path = os.path.join(root, new_name)
                paths_to_rename.append((old_path, new_path))
        
        # Add files to the list
        for file_name in files:
            old_path = os.path.join(root, file_name)
            new_name = clean_filename(file_name)
            if new_name != file_name:
                new_path = os.path.join(root, new_name)
                paths_to_rename.append((old_path, new_path))
    
    # Sort paths by depth (deepest first) to avoid renaming parent directories before children
    paths_to_rename.sort(key=lambda x: -x[0].count(os.sep))
    
    # Rename all paths
    for old_path, new_path in paths_to_rename:
        # Check if the new path already exists
        if os.path.exists(new_path):
            print(f"Warning: Cannot rename {old_path} to {new_path} because the target already exists.")
            continue
        
        # Rename the path
        os.rename(old_path, new_path)
        print(f"Renamed: {old_path} -> {new_path}")

def update_image_references(docs_dir, images_dir):
    """Update image references in MDX files to point to the new image paths."""
    # Create a mapping of old image paths to new image paths
    image_path_mapping = {}
    
    # Find all image files
    for root, _, files in os.walk(images_dir):
        for file_name in files:
            if file_name.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
                # Get the relative path from the images directory
                rel_path = os.path.relpath(os.path.join(root, file_name), images_dir)
                # Create the old path (with Notion IDs)
                old_path = '/images/' + rel_path
                
                # Create the new path (without Notion IDs)
                new_path_parts = []
                for part in rel_path.split(os.sep):
                    new_path_parts.append(clean_filename(part))
                new_path = '/images/' + '/'.join(new_path_parts)
                
                # Add to the mapping
                if old_path != new_path:
                    image_path_mapping[old_path] = new_path
    
    # Update image references in MDX files
    for root, _, files in os.walk(docs_dir):
        for file_name in files:
            if file_name.endswith('.mdx'):
                file_path = os.path.join(root, file_name)
                
                # Read the file content
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace image paths
                for old_path, new_path in image_path_mapping.items():
                    content = content.replace(old_path, new_path)
                
                # Write the updated content
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"Updated image references in: {file_path}")

def update_mint_json():
    """Update the mint.json file to use the new paths."""
    mint_json_path = "mint.json"
    
    # Read the current mint.json
    with open(mint_json_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace paths in the navigation section
    pattern = r'"/docs/(.*?)\s+[0-9a-f]{32}'
    content = re.sub(pattern, r'"/docs/\1', content)
    
    # Write the updated content
    with open(mint_json_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated paths in {mint_json_path}")

def main():
    # Rename files and directories in the docs directory
    print("Renaming files and directories in the docs directory...")
    rename_files_and_directories(DOCS_DIR)
    
    # Rename files and directories in the images directory
    print("\nRenaming files and directories in the images directory...")
    rename_files_and_directories(IMAGES_DIR)
    
    # Update image references in MDX files
    print("\nUpdating image references in MDX files...")
    update_image_references(DOCS_DIR, IMAGES_DIR)
    
    # Update the mint.json file
    print("\nUpdating the mint.json file...")
    update_mint_json()
    
    print("\nCleanup completed successfully!")

if __name__ == "__main__":
    main() 