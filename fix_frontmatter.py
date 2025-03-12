#!/usr/bin/env python3

import os
import re
import glob
import sys

def fix_frontmatter(base_dir="guides-v2"):
    """
    Fix the frontmatter in MDX files by moving import statements outside of the frontmatter section.
    The issue is that import statements are inside the frontmatter (between --- markers),
    but they should be placed after the frontmatter.
    """
    # Find all MDX files
    mdx_files = glob.glob(f"{base_dir}/**/*.mdx", recursive=True)
    print(f"Found {len(mdx_files)} MDX files to process")
    
    files_fixed = 0
    
    for file_path in mdx_files:
        try:
            # Read the file content
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Check if the file has the problematic pattern: import statement inside frontmatter
            if "---" in content and "import" in content and "---" in content.split("import", 1)[1]:
                # Split the content at the first '---'
                parts = content.split("---", 2)
                
                if len(parts) >= 3:
                    # The middle part is the frontmatter content
                    frontmatter = parts[1].strip()
                    
                    # Extract import statements
                    import_lines = []
                    cleaned_frontmatter_lines = []
                    
                    for line in frontmatter.split('\n'):
                        if line.strip().startswith('import '):
                            import_lines.append(line)
                        else:
                            cleaned_frontmatter_lines.append(line)
                    
                    # Reconstruct the content
                    if import_lines:
                        cleaned_frontmatter = '\n'.join(cleaned_frontmatter_lines)
                        new_content = f"---\n{cleaned_frontmatter}\n---\n\n"
                        
                        # Add import statements after frontmatter
                        for import_line in import_lines:
                            new_content += import_line + '\n'
                        
                        # Add the rest of the content
                        if len(parts) > 2:
                            new_content += parts[2]
                        
                        # Write the modified content back to the file
                        with open(file_path, 'w', encoding='utf-8') as file:
                            file.write(new_content)
                        
                        print(f"✅ Fixed frontmatter in: {file_path}")
                        files_fixed += 1
                    else:
                        print(f"No import statements found in frontmatter for: {file_path}")
                else:
                    print(f"Could not parse frontmatter in: {file_path}")
            else:
                print(f"No problematic import statements in: {file_path}")
                
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    print(f"\nFixed frontmatter in {files_fixed} files.")
    
    if files_fixed > 0:
        print("Please run Mintlify again to see if the errors are resolved.")
    else:
        print("No files needed fixing. The issue might be something else.")

if __name__ == "__main__":
    fix_frontmatter() 