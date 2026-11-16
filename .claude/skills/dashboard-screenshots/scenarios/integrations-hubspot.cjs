// HubSpot uses a multi-step connection sheet; prerequisites replace the old scopes accordion.
module.exports = {
	connections: [],
	async run({ goto, page, drawer, field, turnOnSwitches, shot }) {
		await goto('/integrations');
		await page.getByRole('button', { name: 'Connect HubSpot', exact: true }).click();
		const d = drawer();
		await d.getByRole('heading', { name: 'Connect HubSpot' }).waitFor();
		await shot('credentials-prerequisites', { fitDrawer: true });
		await field(d, 'Connection name').fill('HubSpot Production');
		await field(d, 'Private app access token').fill('pat-docs-example-token');
		await field(d, 'Client secret').fill('docs-example-client-secret');
		await shot('connection-credentials', { fitDrawer: true });
		await d.getByRole('button', { name: 'Continue', exact: true }).click();
		await turnOnSwitches(d);
		await shot('sync-options', { fitDrawer: true });
		await d.getByRole('button', { name: 'Continue', exact: true }).click();
		await shot('webhook-configuration', { fitDrawer: true });
		await d.getByRole('button', { name: 'Connect HubSpot', exact: true }).click();
		await d.waitFor({ state: 'hidden' });
		await page.getByRole('button', { name: 'Configure HubSpot', exact: true }).waitFor();
		await shot('connected-integration', { clipTo: page.getByRole('region', { name: 'Connected', exact: true }) });
		await page.getByRole('button', { name: /Configure HubSpot/ }).first().click();
		await drawer().waitFor();
		await field(drawer(), 'Connection name').fill('HubSpot Sandbox');
		await shot('configure-connection', { fitDrawer: true });
		await drawer().getByRole('button', { name: 'Save changes', exact: true }).click();
		await drawer().getByRole('button', { name: 'Save changes', exact: true }).waitFor({ state: 'visible' });
		await page.getByText('HubSpot updated', { exact: true }).waitFor();
		await page.keyboard.press('Escape');
		await drawer().waitFor({ state: 'hidden' });
		await page.getByRole('button', { name: 'Configure HubSpot', exact: true }).click();
		await field(drawer(), 'Connection name').filter({ visible: true }).waitFor();
		if (await field(drawer(), 'Connection name').inputValue() !== 'HubSpot Sandbox') throw new Error('Connection edit did not persist');
	},
};
