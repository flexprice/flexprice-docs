{/*
  CHANGELOG ENTRY TEMPLATE
  ========================
  This is the annotated reference template for a single weekly changelog entry.
  Copy the structure below and fill in the content for each release.

  IMPORTANT: This file is a reference — do NOT commit it to the docs repo.
  The actual changelog lives at: flexprice-docs/docs/changelog.mdx
*/}

{/*
  DATE FORMAT: "Month Xth YYYY"
  Use ordinal suffixes: 1st, 2nd, 3rd, 4th–20th, 21st, 22nd, 23rd, 24th–30th, 31st
  Examples: "January 14th 2026", "March 2nd 2026", "February 23rd 2026"
*/}
<Update label="Month Xth 20XX">

  {/* ========================================
      MAJOR FEATURE 1
      Each major feature gets its own ## heading.
      Typically 2–6 major features per release.
      ======================================== */}

  ## Feature Title

  {/* Brief description: 1-2 sentences. Second person ("you can now…") or neutral voice. */}
  One or two sentence description of what this feature enables and why it matters.

  {/* Sub-feature bullets. Each starts with **Bold label**: description */}
  * **Sub-feature name**: Explanation of what this specific aspect does
  * **Another sub-feature**: More detail on a different aspect of this feature

  <br />

  {/* OPTIONAL: Screenshot — only include if a relevant image exists in the docs repo.
      Path format: /public/images/docs/<Category>/<image-name>.png
      Always use style={{ borderRadius: '0.5rem' }} */}
  <Frame>
    <img src="/public/images/docs/Category/screenshot.png" alt="Descriptive alt text" style={{ borderRadius: '0.5rem' }} />
  </Frame>

  <br />

  {/* OPTIONAL: Link to documentation or API reference.
      Use icon="book-open" for docs, icon="code" for API reference.
      Always include horizontal={true}. */}
  <Card icon="book-open" horizontal={true} href="/docs/section/page" title="Feature name - Documentation" />

  <br />

  {/* ========================================
      MAJOR FEATURE 2
      Repeat the same pattern for each major feature.
      ======================================== */}

  ## Another Feature Title

  Description of this feature.

  * **Label**: Detail about this feature

  <br />

  <Card icon="code" horizontal={true} href="/api-reference/resource/endpoint" title="Endpoint name - API Reference" />

  <br />

  {/* ========================================
      OTHER CHANGES (ACCORDION SECTION)
      This section goes at the BOTTOM of the <Update> block.
      Only include accordion sections that have content.
      ======================================== */}

  **Other changes**

  <AccordionGroup>

    {/* IMPROVEMENTS: Enhancements, performance, UI polish, observability, DX improvements */}
    <Accordion title="Improvements">
      * First improvement bullet — keep concise, one line each
      * Second improvement bullet
      * Third improvement bullet
    </Accordion>

    {/* FIXES: Bug fixes, data corrections, edge-case handling */}
    <Accordion title="Fixes">
      * First fix bullet
      * Second fix bullet
    </Accordion>

    {/* API: New endpoints, changed endpoints, SDK updates, OpenAPI changes */}
    <Accordion title="API">
      * First API change bullet
      * Second API change bullet
    </Accordion>

  </AccordionGroup>

</Update>

{/*
  ========================================
  EXAMPLES FROM REAL CHANGELOG ENTRIES
  ========================================

  GOOD heading + description:

    ## Wallet alerts
    Real-time wallet balance monitoring with configurable alert thresholds.
    * **Real-time balance event processing**: Wallet alert triggers now process all balance events with improved cache handling for accuracy
    * **Ongoing balance notifications**: Low-balance alerts are sent continuously as the wallet balance stays below threshold

  GOOD accordion bullets:

    <Accordion title="Improvements">
      * Temporal workflow history and filters for better observability into background job execution
      * VAPI pricing units added to support voice API consumption-based billing
      * Edit subscription UI improvements
    </Accordion>

  BAD (too vague):
    * Updated some things
    * Fixed bugs

  BAD (too long):
    * We have made significant improvements to the way that the system handles
      wallet balance calculations by implementing a new caching layer that...

  ========================================
  INTEGRATION INSTRUCTIONS
  ========================================

  To add a new changelog entry to the live docs:

  1. Open flexprice-docs/docs/changelog.mdx
  2. Insert the new <Update> block immediately after the frontmatter (--- block)
  3. The most recent entry should always be at the top
  4. Commit and push to deploy via Mintlify
*/}
