// Worked example: the HubSpot connection flow used on integrations/hubspot/connection-setup.
// Produces connection, required-scopes, webhook-configuration, connected-account and
// edit-connection screenshots for images/docs/integrations/hubspot/.
//
// The same pattern fits any drawer: change the route, the drawer title, the field text (from
// flexprice-front/src/i18n/locales/en/*.json) and the sections that expand.
module.exports = {
	// Connections that already exist when the page loads (none: we create one below).
	connections: [],

	async run({ goto, page, drawer, scrollDrawer, turnOnSwitches, shot }) {
		await goto('/tools/integrations/hubspot');
		const add = page.getByRole('button', { name: 'Add a connection' });
		await add.waitFor({ timeout: 60000 });

		// Drawer filled in with example values, every sync toggle on, scrolled to the top.
		await add.click();
		const d = drawer();
		await d.getByText('Connect to HubSpot').waitFor();
		// The drawer's labels are not linked to their inputs, so fill by placeholder.
		await d.getByPlaceholder('e.g., Production HubSpot').fill('HubSpot Production');
		await d.getByPlaceholder('pat-...').fill('pat-na1-7c1e2f4a-5b6d-4e8f-9a0b-1c2d3e4f5a6b');
		await d.getByPlaceholder('Enter your client secret').fill('3f9b2c1d-8e7a-4b6c-9d5e-2a1b0c9d8e7f');
		await turnOnSwitches(d);
		await scrollDrawer('top');
		await shot('connection');

		// Required Scopes expanded, with its header at the top of the drawer.
		const scopes = d.getByRole('button', { name: 'Required Scopes' });
		await scopes.click();
		await scopes.evaluate((el) => el.scrollIntoView({ block: 'start' }));
		await shot('required-scopes');

		// Webhook URL and the events to subscribe to, drawer scrolled to the bottom.
		await scopes.click();
		await d.getByRole('button', { name: 'Webhook Events to Subscribe' }).click();
		await scrollDrawer('bottom');
		await shot('webhook-configuration');

		// Happy path: create the connection, then capture the page down to Connected Accounts.
		// Clipping there keeps the dashboard's own integration description out of the image.
		await d.getByRole('button', { name: 'Create Connection' }).click();
		await d.waitFor({ state: 'hidden' });
		const name = page.getByText('HubSpot Production', { exact: true }).first();
		await name.waitFor();
		const card = name.locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " card ")][1]');
		await shot('connected-account', { clipTo: card });

		// Edit drawer, opened after a reload so no section is left expanded.
		await page.reload({ waitUntil: 'domcontentloaded' });
		await page.getByText('HubSpot Production', { exact: true }).first().waitFor({ timeout: 60000 });
		await page.locator('button:has(svg.lucide-pencil)').first().click();
		await drawer().getByText('Edit HubSpot Connection').waitFor();
		await shot('edit-connection');
	},
};
