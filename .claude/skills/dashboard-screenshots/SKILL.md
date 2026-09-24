---
name: dashboard-screenshots
description: Use when a Flexprice docs page needs screenshots of any Flexprice dashboard screen, such as a list page, a detail page, a create or edit form or drawer, a settings screen, or an integration's connection drawer, when existing dashboard screenshots are missing or outdated, or when asked to run the frontend locally to capture images for the docs
---

# Dashboard Screenshots

## Overview

Docs screenshots come from the real dashboard (`flexprice-front`) running locally, with every API call answered by mock data inside the browser. It works for any screen: a page, a form, a drawer or dialog, for any feature or integration. No backend, Docker, database, sign-up, or real account is involved, and no request reaches the real API. The UI is real; the data is example data. The images match the existing ones in `images/docs/`: 2940 px wide, drawers over the blurred page, and URLs on `https://api.cloud.flexprice.io`.

Not for screens inside a third-party product (a provider's own dashboard or app settings). Those need the user's own account, so ask the user for them.

## Quick reference

| What | Value |
|---|---|
| Start, stop, check the frontend | `bash .claude/skills/dashboard-screenshots/scripts/serve-frontend.sh start` (or `stop`, `status`). `stop` only stops the server that `start` launched |
| Capture | `node .claude/skills/dashboard-screenshots/scripts/capture.cjs <scenario.cjs> <out-dir>` |
| Worked examples in `scenarios/` | `customers-list.cjs`: listed data and a create drawer. `product-catalog-features.cjs`: a full-page form with a dropdown. `integrations-hubspot.cjs`: a connection drawer, create, and edit |
| Frontend repo | `flexprice-front` next to this repo; override with `FLEXPRICE_FRONT` |
| Port | 3100. Never 3000, which is usually the user's `mintlify dev` preview |
| Image size | 1470x940 viewport at 2x; `fitDrawer` and `fitTo` grow it for taller content |
| Example data | Acme Inc, Sandbox, `docs@example.com`, `tenant_01K1TJDVNSN7TWY8CZY870QMNV`, `env_01K1TJJF0CJR410C6QVPYQTNV0`; other emails on `example.com` |
| Output | `images/docs/<section>/<page>/<kebab-name>.png`, mirroring the docs page (`wallet/top-up-wallet/`, `integrations/hubspot/`) |

## Steps

1. If `flexprice-front/node_modules` is missing, run `HUSKY=0 npm ci` in that repo. The install stays inside the repo, and `HUSKY=0` leaves its git hooks alone.
2. Run `serve-frontend.sh start`.
3. Create `scenarios/<screen>.cjs` from the closest worked example. Take the route from `flexprice-front/src/core/routes/Routes.tsx` and the text of buttons and fields from `flexprice-front/src/i18n/locales/en/*.json`. Keep the scenario here so the images can be regenerated when the dashboard changes.
4. Run `capture.cjs`, then read its report:
   - `Console errors` must be `(none)`.
   - "API calls" lists what the screen requested. For each endpoint the image should show data from, add a `routes` entry with example data shaped like the types in `flexprice-front/src/api/<Entity>Api.ts` and `src/types/dto`.
   - Endpoints under "Answered with an empty default list" are fine when the screen does not show that data.
5. Open every screenshot with the Read tool. Check the labels you clicked, since some change with state (a list's create button reads "Create ..." only when the list is empty, "Add" otherwise). Reject blank frames, login pages, and cut-off drawers or forms.
6. Compare the screen with the docs text. If they disagree, check the frontend code: update the docs when they are stale, and keep wrong dashboard text out of the image by clipping it or shooting only the drawer.
7. Copy the images into the docs, add `<Frame>` blocks as the docs-writing skill describes, then run `mintlify validate` and `mintlify broken-links`.
8. Run `serve-frontend.sh stop`.

## Scenario API

A scenario exports `run(helpers)` and, optionally, `routes` (a list, or a function of `{ listResponse, example }` that returns one), `connections` (integration connections that already exist), and `viewport`. `run` receives:

- `goto(route)`, `page`, `drawer()`, `example`
- `field(scope, label)`: the input after a label, with or without a placeholder.
- `choose(scope, label, option)`: picks a dropdown option; both names match from the start.
- `turnOnSwitches(scope)`: turns every toggle in `scope` on.
- `scrollDrawer('top' | 'bottom')`: scrolls the open drawer.
- `shot(name, options)`: saves the viewport. `{ fitDrawer: true }` fits the whole open drawer, `{ fitTo: locator }` fits a page down to that element (a form's Save button), and `{ clipTo: locator }` keeps only the part above that element's bottom edge.

## Common mistakes

| Mistake | Instead |
|---|---|
| Starting Docker and the backend, signing up, or logging in to a real account | Not needed. The mocks answer every request and keep real data out of the docs |
| Showing `http://localhost:8080` URLs, then editing them in the page | `serve-frontend.sh` sets the cloud API URL, and the mocks still answer everything |
| Editing the frontend `.env`, or using or stopping port 3000 | The script passes its values as environment variables and uses port 3100 |
| `getByLabel` on text fields, or clicking a dropdown's visible text | Input labels are often not linked. Use `field()` or `getByPlaceholder`, and `choose()` for dropdowns |
| A drawer or form cut off, or starting halfway down | Use `fitDrawer` or `fitTo`. Turning on toggles scrolls a drawer, so `scrollDrawer('top')` before a plain `shot` |
| An empty list or table in the image | Add a `routes` entry for the endpoint listed under "API calls" |
| Real names, emails, or IDs | Use the example data and `example.com` addresses |
| `chrome --screenshot`, or killing Chrome by name | It captures before the app renders and cannot click. `capture.cjs` closes its own browser |

The rocket button at the bottom right is the dashboard's debug menu, which appears in every development environment, including the mocked Sandbox. It also appears in the existing screenshots, so leave it; the fit options keep it clear of buttons.
