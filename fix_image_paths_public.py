#!/usr/bin/env python3

import os
import re
import glob
import urllib.parse

# Configuration
DOCS_DIR = "docs"

def fix_image_paths(file_path):
    """Fix image paths in an MDX file to use /public prefix and URL encoding."""
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match image references
    pattern = r'!\[(.*?)\]\(/images/docs/(.*?)\)'
    
    # Replace with the correct path
    def replace_image(match):
        alt_text = match.group(1)
        path = match.group(2)
        
        # URL encode the path components
        path_parts = path.split('/')
        encoded_parts = []
        for part in path_parts:
            encoded_parts.append(urllib.parse.quote(part))
        
        # Create the new path with /public prefix
        new_path = '/public/images/docs/' + '/'.join(encoded_parts)
        
        return f'![{alt_text}]({new_path})'
    
    # Replace all image references
    new_content = re.sub(pattern, replace_image, content)
    
    # Also check for any remaining image references without the /public prefix
    pattern2 = r'!\[(.*?)\]\((/images/.*?)\)'
    new_content = re.sub(pattern2, r'![\1](/public\2)', new_content)
    
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