#!/usr/bin/env python3

import os
import re
import glob

# Configuration
DOCS_DIR = "docs"

def fix_callout_imports(file_path):
    """Fix Callout component imports in an MDX file."""
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if the file uses the Callout component
    if '<Callout>' in content:
        # Pattern to match the old import statement
        old_import_pattern = r"import\s+{\s*Callout\s*}\s+from\s+['\"]\/snippets\/callout['\"]"
        
        # Check if the file has the old import statement
        if re.search(old_import_pattern, content):
            # Replace with the new import statement
            new_content = re.sub(old_import_pattern, "import Callout from '../components/Callout'", content)
            
            # Write the updated content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"Fixed Callout import in: {file_path}")
            return True
    
    return False

def main():
    # Find all MDX files
    mdx_files = glob.glob(f"{DOCS_DIR}/**/*.mdx", recursive=True)
    
    # Fix Callout imports in each file
    fixed_files = 0
    for file_path in mdx_files:
        if fix_callout_imports(file_path):
            fixed_files += 1
    
    print(f"\nFixed Callout imports in {fixed_files} files.")

if __name__ == "__main__":
    main() 