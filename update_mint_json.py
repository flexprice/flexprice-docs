#!/usr/bin/env python3

import os
import json
import glob
from pathlib import Path

# Configuration
DOCS_DIR = "docs"
MINT_JSON_PATH = "mint.json"

def clean_path(path):
    """Clean up a path for use in mint.json."""
    # Remove the .mdx extension
    if path.endswith('.mdx'):
        path = path[:-4]
    # Ensure the path starts with a slash
    if not path.startswith('/'):
        path = '/' + path
    return path

def get_title_from_frontmatter(file_path):
    """Extract the title from the frontmatter of an MDX file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if the file has frontmatter
    if not content.startswith('---'):
        return None
    
    # Extract the frontmatter
    frontmatter_end = content.find('---', 3)
    if frontmatter_end == -1:
        return None
    
    frontmatter = content[3:frontmatter_end].strip()
    
    # Look for the title
    for line in frontmatter.split('\n'):
        if line.startswith('title:'):
            # Extract the title, removing quotes if present
            title = line[6:].strip()
            if title.startswith('"') and title.endswith('"'):
                title = title[1:-1]
            return title
    
    return None

def build_navigation():
    """Build the navigation structure for mint.json."""
    # Find all MDX files
    mdx_files = glob.glob(f"{DOCS_DIR}/**/*.mdx", recursive=True)
    
    # Create a mapping of file paths to titles
    file_titles = {}
    for file_path in mdx_files:
        title = get_title_from_frontmatter(file_path)
        if title:
            # Convert the file path to the format used in mint.json
            mint_path = clean_path(os.path.relpath(file_path, '.'))
            file_titles[mint_path] = title
    
    # Build the navigation structure
    navigation = []
    
    # Add the main sections
    main_sections = {
        "Welcome": ["/docs/Welcome to Flexprice"],
        "Getting Started": ["/docs/Getting started"],
        "Product Catalogue": [
            "/docs/Product catalogue",
            {
                "group": "Plans",
                "pages": [
                    "/docs/Product catalogue/Plans",
                    "/docs/Product catalogue/Plans/Overview",
                    "/docs/Product catalogue/Plans/Creating a plan",
                    "/docs/Product catalogue/Plans/Charges in plans",
                    "/docs/Product catalogue/Plans/Charges in plans/Flat fee",
                    "/docs/Product catalogue/Plans/Charges in plans/Package",
                    "/docs/Product catalogue/Plans/Charges in plans/Volume tiered",
                    "/docs/Product catalogue/Plans/Use cases",
                    "/docs/Product catalogue/Plans/Archiving a plan"
                ]
            },
            {
                "group": "Features",
                "pages": [
                    "/docs/Product catalogue/Features"
                ]
            },
            "/docs/Product catalogue/Pricing widget"
        ],
        "Customers": [
            "/docs/Customers",
            "/docs/Bulk import"
        ],
        "Subscriptions": [
            "/docs/Subscriptions"
        ],
        "Wallet": [
            "/docs/Wallet"
        ],
        "Invoices": [
            "/docs/Invoices"
        ],
        "Event Debugger": [
            "/docs/Event debugger"
        ]
    }
    
    # Add each section to the navigation
    for group_name, pages in main_sections.items():
        group = {
            "group": group_name,
            "pages": []
        }
        
        # Add each page to the group
        for page in pages:
            if isinstance(page, str):
                # Check if the page exists in our file_titles mapping
                if page in file_titles:
                    group["pages"].append(page)
                else:
                    # Try to find a matching page
                    for path in file_titles.keys():
                        if path.lower() == page.lower():
                            group["pages"].append(path)
                            break
            elif isinstance(page, dict):
                # This is a nested group
                nested_group = {
                    "group": page["group"],
                    "pages": []
                }
                
                # Add each page to the nested group
                for nested_page in page["pages"]:
                    if nested_page in file_titles:
                        nested_group["pages"].append(nested_page)
                    else:
                        # Try to find a matching page
                        for path in file_titles.keys():
                            if path.lower() == nested_page.lower():
                                nested_group["pages"].append(path)
                                break
                
                # Add the nested group to the parent group
                if nested_group["pages"]:
                    group["pages"].append(nested_group)
        
        # Add the group to the navigation
        if group["pages"]:
            navigation.append(group)
    
    return navigation

def update_mint_json():
    """Update the mint.json file with the new navigation structure."""
    # Check if mint.json exists
    if not os.path.exists(MINT_JSON_PATH):
        print(f"Error: {MINT_JSON_PATH} not found.")
        return
    
    # Read the current mint.json
    with open(MINT_JSON_PATH, 'r', encoding='utf-8') as f:
        mint_json = json.load(f)
    
    # Build the new navigation
    navigation = build_navigation()
    
    # Update the navigation in mint.json
    mint_json["navigation"] = navigation
    
    # Write the updated mint.json
    with open(MINT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(mint_json, f, indent=2)
    
    print(f"Updated {MINT_JSON_PATH} with the new navigation structure.")

if __name__ == "__main__":
    update_mint_json() 