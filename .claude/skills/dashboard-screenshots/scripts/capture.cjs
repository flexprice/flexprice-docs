// Captures docs screenshots of the Flexprice dashboard by driving the locally running frontend
// in headless Chrome against the mock API in mock-api.cjs.
//
// Usage: node capture.cjs <scenario.cjs> <out-dir>
// Env:   PORTAL  frontend repo (default: portal next to the docs repo)
//        APP_URL          running frontend (default: http://localhost:3100)
const fs = require('fs');
const path = require('path');
const { EXAMPLE, createMockApi, listResponse } = require('./mock-api.cjs');

const DOCS_ROOT = path.resolve(__dirname, '../../../..');
const FRONT = process.env.PORTAL || path.resolve(DOCS_ROOT, '../portal');
const APP_URL = (process.env.APP_URL || 'http://localhost:3100').replace(/\/$/, '');
const [scenarioArg, outArg] = process.argv.slice(2);

function fail(message) {
	console.error('capture: ' + message);
	process.exit(1);
}

if (!scenarioArg || !outArg) fail('usage: node capture.cjs <scenario.cjs> <out-dir>');
let playwright;
try {
	playwright = require(path.join(FRONT, 'apps/console/node_modules/@playwright/test'));
} catch {
	fail(`Playwright not found in ${FRONT}/node_modules. Run: cd ${FRONT} && HUSKY=0 pnpm install --frozen-lockfile`);
}
const scenario = require(path.resolve(scenarioArg));
const OUT = path.resolve(outArg);
fs.mkdirSync(OUT, { recursive: true });

// Scrolls every scrollable element inside `root` to its top or bottom edge. Needed because
// clicking a control near the bottom of a drawer scrolls the drawer.
async function scrollWithin(root, where) {
	await root.evaluate((el, where) => {
		for (const n of [el, ...el.querySelectorAll('*')]) {
			const s = getComputedStyle(n);
			if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && n.scrollHeight > n.clientHeight + 2) {
				n.scrollTop = where === 'top' ? 0 : n.scrollHeight;
			}
		}
	}, where);
}

// Scrolls the window and every scrollable element on the page back to the top.
async function scrollPageToTop(page) {
	await page.evaluate(() => {
		window.scrollTo(0, 0);
		for (const n of document.querySelectorAll('*')) {
			const s = getComputedStyle(n);
			if (s.overflowY === 'auto' || s.overflowY === 'scroll') n.scrollTop = 0;
		}
	});
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const KNOWN_PORTAL_WARNINGS = ['Encountered a script tag while rendering React component.'];

(async () => {
	try {
		await fetch(APP_URL);
	} catch {
		fail(`nothing is serving ${APP_URL}. Start it with: bash ${path.join(__dirname, 'serve-frontend.sh')} start`);
	}

	// `routes` may be a list or a function of { listResponse, example }, so a scenario stored
	// anywhere can build example data without requiring mock-api.cjs itself.
	const routes = typeof scenario.routes === 'function' ? scenario.routes({ listResponse, example: EXAMPLE }) : scenario.routes;
	const mock = createMockApi({ appOrigin: new URL(APP_URL).origin, routes, connections: scenario.connections });
	const consoleErrors = [];
	const ignoredWarnings = [];
	let page;
	const written = [];
	// Mapping the API host to a closed local port means a request that slips past the mocks
	// fails instead of reaching the real API.
	const browser = await playwright.chromium.launch({
		headless: true,
		args: [`--host-resolver-rules=MAP ${EXAMPLE.apiHost} 127.0.0.1:9`],
	});
	try {
		const context = await browser.newContext({ serviceWorkers: 'block', viewport: scenario.viewport || { width: 1470, height: 940 }, deviceScaleFactor: 2 });
		await context.addInitScript(
			({ user, environmentId }) => {
				localStorage.setItem('flexprice.session', JSON.stringify({ token: 'docs-preview-placeholder', userId: user.id, tenantId: user.tenant.id }));
				localStorage.setItem('flexprice.environment', environmentId);
				localStorage.setItem('fp.changelog.dismissed', JSON.stringify(['2026-11-console-walkthrough']));
				localStorage.setItem('theme', 'light');
			},
			{ user: mock.user, environmentId: EXAMPLE.environmentId },
		);
		await context.route('**/*', async (route) => {
			const url = new URL(route.request().url());
			if (url.origin === new URL(APP_URL).origin) return route.continue();
			if (url.hostname === EXAMPLE.apiHost) return mock.handle(route);
			return route.abort('blockedbyclient');
		});
		page = await context.newPage();
		page.on('console', (m) => {
			if (m.type() !== 'error') return;
			const message = m.text();
			(KNOWN_PORTAL_WARNINGS.some((prefix) => message.startsWith(prefix)) ? ignoredWarnings : consoleErrors).push(message);
		});
		page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 300)));
		page.on('requestfailed', (r) => r.url().includes(EXAMPLE.apiHost) && consoleErrors.push(`requestfailed: ${r.method()} ${r.url()}`));

		const helpers = {
			page,
			example: EXAMPLE,
			api: mock.state,
			async goto(route) {
				await page.goto(APP_URL + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
			},
			drawer: () => page.getByRole('dialog'),
			scrollDrawer: (where) => scrollWithin(page.getByRole('dialog'), where),
			// Portal form controls expose accessible names, including FormRow's aria-label.
			field: (scope, label) =>
				scope.getByRole('textbox', { name: label, exact: true }),
			async turnOnSwitches(scope = page) {
				for (const sw of await scope.getByRole('switch').all()) {
					if ((await sw.getAttribute('aria-checked')) !== 'true') await sw.click();
				}
			},
			// Picks an option in a dropdown. Both names match from the start, so 'Type' finds a
			// required "Type*" field and 'Metered' finds an option that carries a description.
			async choose(scope, label, option) {
				await scope.getByRole('combobox', { name: new RegExp('^' + escapeRegExp(label)) }).click();
				await page.getByRole('option', { name: new RegExp('^' + escapeRegExp(option)) }).first().click();
			},
			// shot('name')                       the viewport
			// shot('name', { clipTo: locator })  from the top of the page down to that element
			// shot('name', { fitTo: locator })   a whole page taller than the window: everything is
			//   scrolled to the top and the window ends 64px below that element (a form's Save button)
			// shot('name', { fitDrawer: true })  grows the window to fit the open sheet
			async shot(name, { clipTo, padding = 16, fitDrawer = false, fitTo } = {}) {
				for (const close of await page.getByRole('button', { name: 'Close toast', exact: true }).all()) await close.click();
				const file = path.join(OUT, name + '.png');
				const before = page.viewportSize();
				const resized = fitDrawer || !!fitTo;
				if (fitTo) {
					await page.evaluate(() => document.activeElement && document.activeElement.blur());
					await scrollPageToTop(page);
					const box = await fitTo.boundingBox();
					const height = Math.ceil(box.y + box.height + 64);
					if (height > before.height) await page.setViewportSize({ width: before.width, height });
					await scrollPageToTop(page);
				}
				if (fitDrawer) {
					const dialog = page.getByRole('dialog');
					const overflow = await dialog.evaluate((el) => {
						let max = 0;
						for (const n of [el, ...el.querySelectorAll('*')]) {
							const s = getComputedStyle(n);
							if (s.overflowY === 'auto' || s.overflowY === 'scroll') max = Math.max(max, n.scrollHeight - n.clientHeight);
						}
						return max;
					});
					if (overflow > 0) await page.setViewportSize({ width: before.width, height: before.height + overflow + 48 });
					await scrollWithin(dialog, 'top');
				}
				await page.waitForTimeout(500);
				let clip;
				if (clipTo) {
					const box = await clipTo.boundingBox();
					clip = { x: 0, y: 0, width: page.viewportSize().width, height: Math.ceil(box.y + box.height + padding) };
				}
				await page.screenshot({ path: file, clip });
				if (resized) await page.setViewportSize(before);
				written.push(file);
			},
		};
		await scenario.run(helpers);
	} catch (e) {
		process.exitCode = 1;
		console.log('SCENARIO FAILED: ' + String(e).slice(0, 800));
		if (page) {
			await page.screenshot({ path: path.join(OUT, 'failure.png'), fullPage: true });
			fs.writeFileSync(path.join(OUT, 'failure-aria.txt'), await page.locator('body').ariaSnapshot());
		}
	} finally {
		await browser.close();
		if (consoleErrors.length) process.exitCode = 1;
		console.log('Screenshots:\n  ' + (written.join('\n  ') || '(none)'));
		console.log('API calls:\n  ' + [...new Set(mock.calls)].join('\n  '));
		console.log(
			'Answered with an empty default list (normal for data the screen does not show; add a route when the screen should show it):\n  ' +
				([...mock.defaulted].join('\n  ') || '(none)'),
		);
		console.log('Console errors:\n  ' + ([...new Set(consoleErrors)].join('\n  ') || '(none)'));
		console.log('Ignored known portal warnings:\n  ' + ([...new Set(ignoredWarnings)].join('\n  ') || '(none)'));
	}
})();
