#!/bin/bash

# Script to delete all .md files in the guides-v2 directory
# This will help avoid confusion between .md and .mdx files

# Set the base directory
BASE_DIR="guides-v2"

# Find and delete all .md files
find "$BASE_DIR" -name "*.md" -not -name "README.md" | while read -r file; do
    echo "Deleting: $file"
    rm "$file"
done

echo "Deletion complete!" 