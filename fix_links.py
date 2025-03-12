#!/usr/bin/env python3

import os
import re
import glob

# Base directory
base_dir = "guides-v2"

# Find all MDX files
mdx_files = glob.glob(f"{base_dir}/**/*.mdx", recursive=True)

# Regular expression for matching internal links (but not image links)
link_pattern = re.compile(r'(?<!!)\[(.*?)\]\((.*?)\)')

# Process each file
for file_path in mdx_files:
    try:
        # Read the file content
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Function to replace internal links
        def replace_link(match):
            link_text = match.group(1)
            link_path = match.group(2)
            
            # Skip external links (http, https, mailto)
            if link_path.startswith(('http://', 'https://', 'mailto:')):
                return f"[{link_text}]({link_path})"
            
            # Extract the filename from the path
            if '%20' in link_path:
                # It's a URL-encoded path
                filename = os.path.basename(link_path)
                # Add .mdx extension if it doesn't have one
                if not filename.endswith('.mdx') and not filename.endswith('.md'):
                    new_path = f"{link_path}.mdx"
                else:
                    # Replace .md with .mdx if needed
                    new_path = link_path.replace('.md', '.mdx')
                return f"[{link_text}]({new_path})"
            else:
                # It might be a regular path
                return f"[{link_text}]({link_path})"
        
        # Replace links
        modified_content = link_pattern.sub(replace_link, content)
        
        # Write the modified content back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(modified_content)
        
        print(f"Fixed links in: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Link conversion complete!") 