#!/usr/bin/env python3

import os
import subprocess
import sys
import shutil
from pathlib import Path

def run_command(command, description):
    """Run a command and print its output."""
    print(f"\n=== {description} ===")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(f"Error: {result.stderr}")
    if result.returncode != 0:
        print(f"Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    return result.stdout

def ensure_directories():
    """Ensure that the required directories exist."""
    os.makedirs("docs", exist_ok=True)
    os.makedirs("public/images/docs", exist_ok=True)

def clean_directories():
    """Clean the target directories."""
    if os.path.exists("docs"):
        shutil.rmtree("docs")
    if os.path.exists("public/images/docs"):
        shutil.rmtree("public/images/docs")
    ensure_directories()

def create_conversion_summary(summary):
    """Create a summary of the conversion process."""
    with open("conversion_summary.md", "w", encoding="utf-8") as f:
        f.write("# Conversion Summary\n\n")
        f.write(summary)

def main():
    # Clean and ensure directories
    clean_directories()
    
    # Run the conversion script
    print("Starting conversion process...")
    run_command("python3 convert_notion_to_mdx.py", "Converting Notion export to MDX")
    
    # Verify the MDX files
    verification_output = run_command("python3 verify_mdx_files.py", "Verifying MDX files")
    
    # Update the mint.json file
    run_command("python3 update_mint_json.py", "Updating mint.json")
    
    # Create a summary of the conversion
    summary = f"""
## Conversion Process

1. Cleaned target directories
2. Converted Notion export to MDX format
3. Verified MDX files
4. Updated mint.json

## Verification Results

{verification_output}

## Next Steps

1. Review the MDX files in the `docs` directory
2. Check that images are correctly displayed
3. Test the documentation with Mintlify
4. Make any necessary adjustments
"""
    create_conversion_summary(summary)
    print("\nConversion process completed successfully!")
    print("See conversion_summary.md for details.")

if __name__ == "__main__":
    main() 