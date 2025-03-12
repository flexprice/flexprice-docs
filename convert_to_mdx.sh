#!/bin/bash

# Script to convert Markdown files to MDX in the guides-v2 directory
# This script will:
# 1. Find all .md files in the guides-v2 directory
# 2. Create a copy with .mdx extension
# 3. Add frontmatter to each file
# 4. Fix any Notion-specific syntax that might not work in MDX

# Set the base directory
BASE_DIR="guides-v2"

# Find all markdown files
find "$BASE_DIR" -name "*.md" | while read -r file; do
    # Skip .DS_Store files and other hidden files
    if [[ $(basename "$file") == .* ]]; then
        continue
    fi
    
    # Create the new filename with .mdx extension
    mdx_file="${file%.md}.mdx"
    
    # Get the title from the first heading in the file
    title=$(grep -m 1 "^# " "$file" | sed 's/^# //')
    if [ -z "$title" ]; then
        # If no heading found, use the filename without extension and ID
        title=$(basename "$file" .md | sed 's/ [0-9a-f]\{32\}$//')
    fi
    
    # Create frontmatter
    frontmatter="---\ntitle: \"$title\"\ndescription: \"Flexprice documentation\"\n---\n\n"
    
    # Create the MDX file with frontmatter
    echo -e "$frontmatter$(cat "$file")" > "$mdx_file"
    
    # Fix Notion-specific syntax
    # 1. Replace Notion image links with standard markdown image links
    sed -i '' -E 's/!\[([^]]*)\]\(([^)]*) [0-9a-f]{32}\/([^)]*)\)/![\\1](\/images\/guides-v2\/\\3)/g' "$mdx_file"
    
    # 2. Replace Notion page links with relative links
    sed -i '' -E 's/\[([^]]*)\]\(([^)]*) [0-9a-f]{32}(\.md)?\)/[\\1](\\2)/g' "$mdx_file"
    
    # 3. Convert Notion asides to MDX callouts
    sed -i '' -E 's/<aside>(.*)<\/aside>/{% callout %}\\1{% \/callout %}/gs' "$mdx_file"
    
    echo "Converted: $file -> $mdx_file"
done

# Create an images directory if it doesn't exist
mkdir -p public/images/guides-v2

# Copy any images from the Notion export to the public images directory
find "$BASE_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" \) | while read -r image; do
    # Get the relative path within the guides-v2 directory
    rel_path=$(echo "$image" | sed "s|$BASE_DIR/||")
    
    # Create the destination directory
    dest_dir="public/images/guides-v2/$(dirname "$rel_path")"
    mkdir -p "$dest_dir"
    
    # Copy the image
    cp "$image" "public/images/guides-v2/$(basename "$image")"
    echo "Copied image: $image -> public/images/guides-v2/$(basename "$image")"
done

echo "Conversion complete!" 