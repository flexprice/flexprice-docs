# Flexprice Documentation Conversion

This repository contains scripts to convert Notion-exported documentation to MDX format for use with Mintlify.

## Overview

The conversion process takes Notion-exported Markdown files and converts them to MDX format, while maintaining the directory structure, fixing image paths, and updating internal links. The process also adds proper frontmatter to each MDX file and updates the `mint.json` file to reflect the new structure.

## Scripts

- `convert_notion_to_mdx.py`: Converts Notion-exported Markdown files to MDX format
- `update_mint_json.py`: Updates the `mint.json` file to reflect the new structure
- `verify_mdx_files.py`: Verifies that the MDX files meet the required standards
- `run_conversion.py`: Runs the entire conversion process
- `clean_filenames.py`: Removes Notion IDs from file and directory names
- `fix_image_paths.py`: Fixes image references in MDX files
- `fix_image_paths_public.py`: Updates image paths to use the /public prefix and URL encoding
- `fix_callout_imports.py`: Updates Callout component imports to use the correct path

## Usage

1. Export your Notion documentation to Markdown format
2. Place the exported files in the `FlexPrice Documentation` directory
3. Run the conversion script:

```bash
python3 run_conversion.py
```

4. Clean up file names and fix image paths:

```bash
python3 clean_filenames.py
python3 fix_image_paths.py
```

5. Update image paths to use the /public prefix and fix Callout imports:

```bash
python3 fix_image_paths_public.py
python3 fix_callout_imports.py
```

6. Review the conversion summary in `conversion_summary.md`
7. Test the documentation with Mintlify:

```bash
npx mintlify dev
```

## Conversion Process

The conversion process performs the following steps:

1. Cleans the target directories (`docs` and `public/images/docs`)
2. Converts Notion-exported Markdown files to MDX format
   - Adds proper frontmatter with title and description
   - Converts Notion asides to MDX Callout components
   - Fixes image paths to point to the correct location
   - Updates internal links to use the correct paths
   - Removes Notion IDs from filenames
3. Copies images to the correct location
4. Verifies that the MDX files meet the required standards
5. Updates the `mint.json` file to reflect the new structure
6. Creates a conversion summary
7. Removes Notion IDs from file and directory names
8. Fixes image references in MDX files
9. Updates image paths to use the /public prefix and URL encoding
10. Creates a proper Callout component in the components directory
11. Fixes API reference warnings in mint.json

## Custom Components

The conversion process creates a custom Callout component for Mintlify in the `components` directory. This component is used to display callouts in the documentation, similar to Notion's aside blocks.

## Verification

The verification process checks that each MDX file:

1. Has proper frontmatter with title and description
2. Does not contain links with `.mdx` extensions
3. Does not have import statements inside the frontmatter
4. Has correct image paths

## Directory Structure

After conversion, the directory structure will be:

- `docs/`: Contains the MDX files with a clean, nested structure
- `public/images/docs/`: Contains the images organized by section
- `components/`: Contains custom components for Mintlify
- `mint.json`: Configuration file for Mintlify with updated navigation
- `conversion_summary.md`: Summary of the conversion process

## Troubleshooting

If you encounter issues during the conversion process:

1. Check the error messages in the console
2. Review the verification results in `conversion_summary.md`
3. Manually fix any issues in the MDX files
4. Run the verification script again:

```bash
python3 verify_mdx_files.py
```

If you encounter issues with the documentation in Mintlify:

1. Check that all image paths are correct and use the format `/public/images/docs/...` with URL encoding for spaces
2. Verify that the Callout component is properly imported from `../components/Callout`
3. Ensure that the navigation in `mint.json` matches the actual file structure
4. Run `npx mintlify dev` to test the documentation locally

## Requirements

- Python 3.6 or higher
- PyYAML package (`pip install pyyaml`)
