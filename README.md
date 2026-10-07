# Flexprice Documentation

Source for the Flexprice docs site at [docs.flexprice.io](https://docs.flexprice.io), built with [Mintlify](https://mintlify.com).

Flexprice lets AI-native and SaaS teams operate usage-based, credit-based, and hybrid pricing with real-time metering and reporting. This repo holds the product guides, the API reference, integration guides, and the changelog.

Related repositories:

- Backend: [flexprice/flexprice](https://github.com/flexprice/flexprice)
- Frontend: [flexprice/flexprice-front](https://github.com/flexprice/flexprice-front)

## Repository layout

```
flexprice-docs/
├── docs/              Product documentation pages (.mdx), grouped by domain
│   ├── getting-started/
│   ├── cli/ and cli-reference/
│   ├── customers/, wallet/, subscriptions/, product-catalogue/, ...
│   └── changelog.mdx  Release notes
├── api-reference/     API reference intro pages (endpoint pages come from the remote spec in docs.json)
├── integrations/      Payment and accounting integration guides (Stripe, Paddle, Razorpay, QuickBooks, Zoho Books, ...)
├── images/            Screenshots and diagrams referenced from pages
├── snippets/          Reusable JSX previews embedded in pages
├── docs.json          Site config and navigation (tabs, groups, page order, redirects)
└── style.css          Custom styling
```

Every page is an `.mdx` file. A page only appears on the site once it is listed in `docs.json`.

## Local development

Preview the site with the Mintlify CLI. It needs Node.js 18 or newer.

```bash
npm i -g mint
```

Run the dev server from the repo root (the folder that contains `docs.json`):

```bash
mint dev
```

The site is served at `http://localhost:3000` and reloads as you edit files.

If you prefer not to install globally, `npx mint dev` works as well.

## Validation

Run these before opening a pull request:

```bash
mint validate       # checks docs.json and page frontmatter
mint broken-links   # checks internal links and image paths
```

Both should finish with no warnings.

## Contributing

- Add a new page as an `.mdx` file with `title` and `description` frontmatter, then register it in `docs.json` under the right group.
- Read two nearby pages before writing so tone, structure, and component usage match the existing docs.
- Put screenshots under `images/` and only reference images that exist in the repo.
- When removing a page, also remove its entry from `docs.json` and any images only that page used.
- API reference endpoint pages are generated from the OpenAPI spec hosted on Speakeasy (the `openapi.source` URL in `docs.json`). There is no spec file in this repo; endpoint changes appear once Speakeasy republishes the spec.
- Add release notes to `docs/changelog.mdx`.

Detailed writing conventions, the supported MDX components, and the changelog format live in `.mintlify/docs-writing-instructions.md` and `.mintlify/changelog-instructions.md`. Keep the `.mintlify/` files in place; Mintlify automation depends on them.

## Publishing

The site deploys automatically through the Mintlify GitHub App. Changes merged into the `main` branch go live on [docs.flexprice.io](https://docs.flexprice.io) without any manual step.

## Troubleshooting

- The dev server fails to start: run `mint update` to get the latest CLI, then retry `mint dev`.
- A page loads as a 404: confirm you are running from the folder that contains `docs.json` and that the page is listed in the navigation.
- An image is missing in the preview: check the path is relative to the repo root (for example `/images/docs/example.png`).
- Validation warns that a page is referenced but does not exist: the page was deleted or renamed, so remove or update its entry in `docs.json`.
