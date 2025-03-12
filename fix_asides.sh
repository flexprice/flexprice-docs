#!/bin/bash

# Script to fix Notion asides in MDX files
# This script will convert Notion <aside> tags to MDX callouts

# Set the base directory
BASE_DIR="guides-v2"

# Find all MDX files
find "$BASE_DIR" -name "*.mdx" | while read -r file; do
    # Use perl instead of sed for multiline replacements
    perl -0777 -i -pe 's/<aside>(.*?)<\/aside>/{% callout %}\1{% \/callout %}/gs' "$file"
    echo "Fixed asides in: $file"
done

echo "Aside conversion complete!" 