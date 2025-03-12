#!/usr/bin/env python3

import os
import re
import glob

def fix_mdx_links(base_dir="guides-v2"):
    """
    Find all MDX files in the base directory and its subdirectories,
    and remove .mdx extensions from all links.
    """
    # Find all MDX files
    mdx_files = glob.glob(f"{base_dir}/**/*.mdx", recursive=True)
    
    # Regular expression to match markdown links with .mdx extension
    link_pattern = re.compile(r'\[(.*?)\]\((.*?)\.mdx\)')
    
    for file_path in mdx_files:
        try:
            # Read the file content
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Check if there are any .mdx links
            if '.mdx)' in content:
                # Replace .mdx extensions in links
                modified_content = link_pattern.sub(r'[\1](\2)', content)
                
                # Write the modified content back to the file
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(modified_content)
                
                print(f"Updated links in: {file_path}")
            else:
                print(f"No .mdx links found in: {file_path}")
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    fix_mdx_links()
    print("Link fixing complete!") 