#!/usr/bin/env python3

import os
import re
import glob

# Base directory
base_dir = "guides-v2"

# Find all MDX files
mdx_files = glob.glob(f"{base_dir}/**/*.mdx", recursive=True)

# Regular expression for matching Notion asides
aside_pattern = re.compile(r'<aside>(.*?)</aside>', re.DOTALL)

# Process each file
for file_path in mdx_files:
    try:
        # Read the file content
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace asides with MDX callouts
        modified_content = aside_pattern.sub(r'<Callout>\1</Callout>', content)
        
        # Write the modified content back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(modified_content)
        
        print(f"Fixed asides in: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Aside conversion complete!") 