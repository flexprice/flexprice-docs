#!/usr/bin/env python3

import os
import re
import glob

# Configuration
DOCS_DIR = "docs"

def fix_image_paths(file_path):
    """Fix image paths in an MDX file."""
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match image references with Notion IDs
    pattern = r'!\[(.*?)\]\(/images/(.*?)\.md/(.*?)\)'
    
    # Replace with the correct path
    def replace_image(match):
        alt_text = match.group(1)
        path = match.group(2)
        filename = match.group(3)
        
        # Clean up the path by removing Notion IDs
        path_parts = path.split('/')
        clean_parts = []
        for part in path_parts:
            # Remove Notion ID from the part
            id_pattern = r'(.*?)\s+[0-9a-f]{32}'
            id_match = re.match(id_pattern, part)
            if id_match:
                clean_parts.append(id_match.group(1).strip())
            else:
                clean_parts.append(part)
        
        # Create the new path
        new_path = '/images/docs/' + '/'.join(clean_parts) + '/' + filename
        
        return f'![{alt_text}]({new_path})'
    
    # Replace all image references
    new_content = re.sub(pattern, replace_image, content)
    
    # Write the updated content if changes were made
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed image paths in: {file_path}")
        return True
    
    return False

def main():
    # Find all MDX files
    mdx_files = glob.glob(f"{DOCS_DIR}/**/*.mdx", recursive=True)
    
    # Fix image paths in each file
    fixed_files = 0
    for file_path in mdx_files:
        if fix_image_paths(file_path):
            fixed_files += 1
    
    print(f"\nFixed image paths in {fixed_files} files.")

if __name__ == "__main__":
    main() 