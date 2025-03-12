#!/usr/bin/env python3

import os
import re
import glob

# Base directory
base_dir = "guides-v2"

# Find all MDX files
mdx_files = glob.glob(f"{base_dir}/**/*.mdx", recursive=True)

# Regular expression for matching frontmatter
frontmatter_pattern = re.compile(r'^---\n(.*?)\n---\n', re.DOTALL)

# Regular expression for checking if Callout is used in the file
callout_pattern = re.compile(r'<Callout>')

# Process each file
for file_path in mdx_files:
    try:
        # Read the file content
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if the file uses Callout component
        if callout_pattern.search(content):
            # Check if the file has frontmatter
            frontmatter_match = frontmatter_pattern.match(content)
            if frontmatter_match:
                # Get the frontmatter content
                frontmatter_content = frontmatter_match.group(1)
                
                # Check if import is already added
                if 'import { Callout } from' not in frontmatter_content:
                    # Add import statement to frontmatter
                    new_frontmatter = f"---\n{frontmatter_content}\nimport {{ Callout }} from 'nextra/components'\n---\n"
                    
                    # Replace the old frontmatter with the new one
                    modified_content = frontmatter_pattern.sub(new_frontmatter, content)
                    
                    # Write the modified content back to the file
                    with open(file_path, 'w', encoding='utf-8') as file:
                        file.write(modified_content)
                    
                    print(f"Added Callout import to: {file_path}")
                else:
                    print(f"Callout import already exists in: {file_path}")
            else:
                print(f"No frontmatter found in: {file_path}")
        else:
            print(f"No Callout component used in: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Callout import addition complete!") 