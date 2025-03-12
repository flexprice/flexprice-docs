#!/usr/bin/env python3

import os
import re
import glob
import yaml

# Configuration
DOCS_DIR = "docs"

def verify_frontmatter(content):
    """Verify that the file has valid frontmatter with title and description."""
    # Check if the file has frontmatter
    if not content.startswith('---'):
        return False, "No frontmatter found"
    
    # Extract the frontmatter
    frontmatter_end = content.find('---', 3)
    if frontmatter_end == -1:
        return False, "Incomplete frontmatter"
    
    frontmatter = content[3:frontmatter_end].strip()
    
    # Parse the frontmatter
    try:
        fm_data = yaml.safe_load(frontmatter)
    except yaml.YAMLError as e:
        return False, f"Invalid YAML in frontmatter: {str(e)}"
    
    # Check for required fields
    if not fm_data.get('title'):
        return False, "Missing title in frontmatter"
    if not fm_data.get('description'):
        return False, "Missing description in frontmatter"
    
    return True, None

def verify_mdx_links(content):
    """Verify that there are no links with .mdx extensions."""
    # Pattern to match markdown links
    link_pattern = re.compile(r'\[(.*?)\]\((.*?)\)')
    
    for match in link_pattern.finditer(content):
        link_path = match.group(2)
        if link_path.endswith('.mdx'):
            return False, f"Link with .mdx extension found: {link_path}"
    
    return True, None

def verify_import_statements(content):
    """Verify that import statements are not inside frontmatter."""
    # Check if the file has frontmatter
    if not content.startswith('---'):
        return True, None
    
    # Extract the frontmatter
    frontmatter_end = content.find('---', 3)
    if frontmatter_end == -1:
        return True, None
    
    frontmatter = content[3:frontmatter_end].strip()
    
    # Check for import statements in frontmatter
    import_pattern = re.compile(r'import\s+.*?from\s+[\'"].*?[\'"].*?\n')
    if import_pattern.search(frontmatter):
        return False, "Import statement found inside frontmatter"
    
    return True, None

def verify_images(content):
    """Verify that image paths are correct."""
    # Pattern to match image references
    img_pattern = re.compile(r'!\[(.*?)\]\((.*?)\)')
    
    for match in img_pattern.finditer(content):
        img_path = match.group(2)
        if not img_path.startswith(('http://', 'https://', '/images/')):
            return False, f"Image path not starting with /images/: {img_path}"
    
    return True, None

def verify_file(file_path):
    """Verify a single MDX file."""
    issues = []
    
    # Read the content of the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verify frontmatter
    frontmatter_valid, frontmatter_issue = verify_frontmatter(content)
    if not frontmatter_valid:
        issues.append(frontmatter_issue)
    
    # Verify MDX links
    links_valid, links_issue = verify_mdx_links(content)
    if not links_valid:
        issues.append(links_issue)
    
    # Verify import statements
    import_valid, import_issue = verify_import_statements(content)
    if not import_valid:
        issues.append(import_issue)
    
    # Verify images
    images_valid, images_issue = verify_images(content)
    if not images_valid:
        issues.append(images_issue)
    
    return issues

def main():
    # Find all MDX files
    mdx_files = glob.glob(f"{DOCS_DIR}/**/*.mdx", recursive=True)
    
    # Counters for verification
    total_files = len(mdx_files)
    files_with_issues = 0
    files_without_frontmatter = 0
    files_without_title = 0
    files_without_description = 0
    files_with_mdx_links = 0
    files_with_import_in_frontmatter = 0
    files_with_image_issues = 0
    
    # Verify each file
    for file_path in mdx_files:
        issues = verify_file(file_path)
        
        if issues:
            files_with_issues += 1
            print(f"Issues in {file_path}:")
            for issue in issues:
                print(f"  - {issue}")
                
                # Update counters based on the issue
                if "No frontmatter found" in issue:
                    files_without_frontmatter += 1
                elif "Missing title" in issue:
                    files_without_title += 1
                elif "Missing description" in issue:
                    files_without_description += 1
                elif "Link with .mdx extension" in issue:
                    files_with_mdx_links += 1
                elif "Import statement found inside frontmatter" in issue:
                    files_with_import_in_frontmatter += 1
                elif "Image path not starting with /images/" in issue:
                    files_with_image_issues += 1
    
    # Print verification summary
    print("\nVerification Summary:")
    print(f"Total MDX files: {total_files}")
    print(f"Files with issues: {files_with_issues}")
    print(f"Files without frontmatter: {files_without_frontmatter}")
    print(f"Files without title: {files_without_title}")
    print(f"Files without description: {files_without_description}")
    print(f"Files with .mdx links: {files_with_mdx_links}")
    print(f"Files with import statements in frontmatter: {files_with_import_in_frontmatter}")
    print(f"Files with image path issues: {files_with_image_issues}")
    
    if files_with_issues == 0:
        print("\nAll MDX files passed verification!")
    else:
        print("\nSome MDX files have issues that need to be fixed.")

if __name__ == "__main__":
    main() 