---
name: dashboard-screenshots
description: Use when a Flexprice docs page needs screenshots of any Flexprice dashboard screen, such as a list page, a detail page, a create or edit form or drawer, a settings screen, or an integration's connection drawer, when existing dashboard screenshots are missing or outdated, or when asked to run the frontend locally to capture images for the docs
---

# Dashboard Screenshots

## Overview

Docs screenshots come from the real dashboard (`portal`) running locally, with every API call answered by mock data inside the browser. It works for any screen: a page, a form, a drawer or dialog, for any feature or integration. No backend, Docker, database, sign-up, or real account is involved, and no request reaches the real API. The UI is real; the data is example data. The images match the existing ones in `images/docs/`: 2940 px wide, drawers over the blurred page, and URLs on `https://api.cloud.flexprice.io`.

Not for screens inside a third-party product (a provider's own dashboard or app settings). Those need the user's own account, so ask the user for them.

## Quick reference

| What | Value |
|---|---|
| Start, stop, check the frontend | `bash .claude/skills/dashboard-screenshots/scripts/serve-frontend.sh start` (or `stop`, `status`). `stop` only stops the server that `start` launched |
| Capture | `node .claude/skills/dashboard-screenshots/scripts/capture.cjs <scenario.cjs> <out-dir>` |
| Worked examples in `scenarios/` | `customers-list.cjs`: listed data and a full-page create form. `product-catalog-features.cjs`: a full-page form with a dropdown. `integrations-hubspot.cjs`: a credentials → sync → webhook sheet from the integrations gallery, create, and configure |
| Frontend repo | `portal` next to this repo; override with `PORTAL` |
| Port | 3100. Never 3000, which is usually the user's `mintlify dev` preview |
| Image size | 1470x940 viewport at 2x; `fitDrawer` and `fitTo` grow it for taller content |
| Example data | Acme Inc, Sandbox, `docs@example.com`, `tenant_01K1TJDVNSN7TWY8CZY870QMNV`, `env_01K1TJJF0CJR410C6QVPYQTNV0`; other emails on `example.com` |
| Output | `images/docs/<section>/<page>/<kebab-name>.png`, mirroring the docs page (`wallet/top-up-wallet/`, `integrations/hubspot/`) |

## Steps

1. If `portal/node_modules` is missing, run `HUSKY=0 pnpm install --frozen-lockfile` in that repo. The install stays inside the repo, and `HUSKY=0` leaves its git hooks alone.
2. Run `serve-frontend.sh start`.
3. Create `scenarios/<screen>.cjs` from the closest worked example. Take the route from `portal/apps/console/src/app/router.tsx` and the text of buttons and fields from `portal/packages/ui`. Keep the scenario here so the images can be regenerated when the dashboard changes.
4. Run `capture.cjs`, then read its report:
   - `Console errors` must be `(none)`.
   - "API calls" lists what the screen requested. For each endpoint the image should show data from, add a `routes` entry with example data shaped like the types in `portal/packages/api` and `packages/domain`; follow the adapters in `packages/query` to distinguish snake_case HTTP DTOs from SDK camelCase models.
   - Endpoints under "Answered with an empty default list" are fine when the screen does not show that data.
5. Open every PNG with an image viewer. Check the labels you clicked against the real UI. Reject blank frames, login pages, and cut-off drawers or forms.
6. Compare the screen with the docs text. If they disagree, check the frontend code: update the docs when they are stale, and keep wrong dashboard text out of the image by clipping it or shooting only the drawer.
7. Copy the images into the docs, add `<Frame>` blocks as the docs-writing skill describes, then run `mintlify validate` and `mintlify broken-links`.
8. Run `serve-frontend.sh stop`.

## Scenario API

A scenario exports `run(helpers)` and, optionally, `routes` (a list, or a function of `{ listResponse, example }` that returns one), `connections` (integration connections that already exist), and `viewport`. `run` receives:

- `goto(route)`, `page`, `drawer()`, `example`
- `field(scope, label)`: the textbox with that exact accessible name, with or without a placeholder.
- `choose(scope, label, option)`: picks a dropdown option; both names match from the start.
- `turnOnSwitches(scope)`: turns every toggle in `scope` on.
- `scrollDrawer('top' | 'bottom')`: scrolls the open drawer.
- `shot(name, options)`: saves the viewport. `{ fitDrawer: true }` fits the whole open drawer, `{ fitTo: locator }` fits a page down to that element (use the form itself when its submit button is in the sticky header), and `{ clipTo: locator }` keeps only the part above that element's bottom edge.

## Common mistakes

| Mistake | Instead |
|---|---|
| Starting Docker and the backend, signing up, or logging in to a real account | Not needed. The mocks answer every request and keep real data out of the docs |
| Showing `http://localhost:8080` URLs, then editing them in the page | `serve-frontend.sh` sets the cloud API URL, and the mocks still answer everything |
| Editing the frontend `.env`, or using or stopping port 3000 | The script passes its values as environment variables and uses port 3100 |
| Guessing labels, routes or dropdown text | Use the accessible names from portal; `field()` selects a textbox by name and `choose()` selects a combobox option. `Field` links labels; required stars can change label text matching |
| A drawer or form cut off, or starting halfway down | Use `fitDrawer` or `fitTo`. Turning on toggles scrolls a drawer, so `scrollDrawer('top')` before a plain `shot` |
| An empty list or table in the image | Add a `routes` entry for the endpoint listed under "API calls" |
| Real names, emails, or IDs | Use the example data and `example.com` addresses |
| `chrome --screenshot`, or killing Chrome by name | It captures before the app renders and cannot click. `capture.cjs` closes its own browser |

Long webhook URLs retain portal’s native horizontal code-block scrolling; do not restyle or shorten them for a screenshot.

Portal has no old rocket debug menu. Do not add one or hide real UI to imitate older images.

## Portal setup and worked flows

The console is `apps/console` in the pnpm + Nx monorepo. Playwright resolves from
`portal/apps/console/node_modules/@playwright/test`; if its Chromium is missing, run
`pnpm --filter console exec playwright install chromium` in portal.

Treat portal as read-only: do not edit code or `.env`. The server script passes
`VITE_FLEXPRICE_API_URL=https://api.cloud.flexprice.io/v1`, `VITE_USE_MOCKS=false`,
and a placeholder `VITE_FLEXPRICE_API_KEY`. The development-only key bypasses sign-in.
Capture seeds `flexprice.environment` and an example `flexprice.session` so tenant identity
and webhook URLs are complete. No real credentials are used.

The browser blocks service workers and intercepts every cloud API request. Other external
requests are blocked, and DNS maps the API host to a closed local port as a second guard.
Keep this interception; bundled MSW fixtures are not used. Bootstrap mocks cover
`/users/me`, `/environments`, `/tenants/:id`, role access, settings, billing status and
billing-entity mode. List search responses use `{ items, pagination }`; connections use
`{ connections, total, limit, offset }`. Look up HTTP transport and special envelopes in
`packages/api`, data hooks and SDK mapping in `packages/query`, and schemas in
`packages/domain` (generated wire DTOs also live in the SDK dependencies).

- Customers: `/customers` → **New customer** → `/customers/new`. Creation is a full page,
  not the old drawer. Outputs: `customers-list.png`, `customer-create-form.png`.
- Features: `/features` → **New feature** → `/features/new`. Creation is a full page;
  type is a radio group and aggregation is a dropdown. Outputs: `features-list.png`,
  `feature-create-form.png`.
- HubSpot: `/integrations` → **Connect HubSpot**. Credentials, sync and webhook are sheet
  steps; the prerequisites notice replaces the old Required Scopes accordion. The connected
  gallery card does not display the connection name. **Configure HubSpot** opens the editable
  sheet; saving keeps it open. Outputs: `credentials-prerequisites.png`,
  `connection-credentials.png`, `sync-options.png`, `webhook-configuration.png`,
  `connected-integration.png`, `configure-connection.png`.
  `/integrations/hubspot` is the per-billing-entity page, not this flow.

## Capture diagnostics

On scenario failure the runner saves `failure.png` and `failure-aria.txt` in the output
directory. Open both before changing selectors: check the route, loading/error state and
actual accessible names. These are diagnostics, not publishable captures.

`Console errors` must be `(none)`; any unexpected console error or page exception makes
capture fail. One known benign portal development warning is allow-listed by its fixed prefix:
`Encountered a script tag while rendering React component.` It comes from next-themes'
inline script in portal's ThemeProvider and is printed separately under
`Ignored known portal warnings`. Do not broaden the allow-list to hide scenario failures.
