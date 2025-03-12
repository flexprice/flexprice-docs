#!/usr/bin/env python3

import os
import re
import glob

# Base directory
base_dir = "guides-v2"

# Find all MDX files
mdx_files = glob.glob(f"{base_dir}/**/*.mdx", recursive=True)

# Regular expression for matching existing frontmatter
frontmatter_pattern = re.compile(r'^---\n(.*?)\n---\n', re.DOTALL)

# Regular expression for matching the first heading
heading_pattern = re.compile(r'^# (.*?)$', re.MULTILINE)

# Process each file
for file_path in mdx_files:
    try:
        # Read the file content
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if the file already has frontmatter
        if not frontmatter_pattern.match(content):
            # Extract the title from the first heading
            heading_match = heading_pattern.search(content)
            if heading_match:
                title = heading_match.group(1)
            else:
                # Use the filename as title if no heading found
                filename = os.path.basename(file_path)
                title = os.path.splitext(filename)[0]
                # Remove the ID part if present
                title = re.sub(r' [0-9a-f]{32}$', '', title)
            
            # Create frontmatter
            frontmatter = f"---\ntitle: \"{title}\"\ndescription: \"Flexprice documentation\"\n---\n\n"
            
            # Add frontmatter to the content
            modified_content = frontmatter + content
            
            # Write the modified content back to the file
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(modified_content)
            
            print(f"Added frontmatter to: {file_path}")
        else:
            print(f"Frontmatter already exists in: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Frontmatter addition complete!") 