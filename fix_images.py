#!/usr/bin/env python3

import os
import re
import glob

# Base directory
base_dir = "guides-v2"

# Find all MDX files
mdx_files = glob.glob(f"{base_dir}/**/*.mdx", recursive=True)

# Regular expression for matching image paths
image_pattern = re.compile(r'!\[(.*?)\]\((.*?)\)')

# Process each file
for file_path in mdx_files:
    try:
        # Read the file content
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Function to replace image paths
        def replace_image_path(match):
            alt_text = match.group(1)
            image_path = match.group(2)
            
            # Extract the image filename
            image_filename = os.path.basename(image_path)
            
            # Create the new path
            new_path = f"/images/guides-v2/{image_filename}"
            
            return f"![{alt_text}]({new_path})"
        
        # Replace image paths
        modified_content = image_pattern.sub(replace_image_path, content)
        
        # Write the modified content back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(modified_content)
        
        print(f"Fixed image paths in: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Image path conversion complete!") 