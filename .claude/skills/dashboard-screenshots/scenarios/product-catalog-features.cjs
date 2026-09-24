// Worked example: a list page plus a full-page create form. Shows the Features list with one
// feature of each basic type, then the Create Feature page filled in with the metered example
// from docs/product-catalogue/features (event tokens_total, SUM of tokens).
// Produces features-list and create-feature.
module.exports = {
	routes: ({ listResponse, example }) => {
		const feature = (n, name, type, updatedAt, extra = {}) => ({
			id: `feat_docs_${n}`,
			name,
			description: '',
			lookup_key: 'feat-' + name.replace(/\s/g, '-').toLowerCase(),
			type,
			meter_id: '',
			metadata: {},
			unit_singular: '',
			unit_plural: '',
			status: 'published',
			environment_id: example.environmentId,
			tenant_id: example.tenantId,
			created_at: updatedAt,
			updated_at: updatedAt,
			created_by: example.userId,
			updated_by: example.userId,
			...extra,
		});
		// Newest first, matching the list's default sort (Updated at, descending).
		const features = [
			feature(1, 'API Calls', 'metered', '2026-09-23T10:00:00Z', { meter_id: 'meter_docs_1', unit_singular: 'call', unit_plural: 'calls' }),
			feature(2, 'SAML SSO Authentication', 'boolean', '2026-09-18T10:00:00Z'),
			feature(3, 'Priority Support', 'static', '2026-09-10T10:00:00Z'),
		];
		return [{ method: 'POST', path: '/features/search', respond: () => listResponse(features) }];
	},

	async run({ goto, page, choose, shot }) {
		await goto('/product-catalog/features');
		await page.getByText('Priority Support', { exact: true }).first().waitFor({ timeout: 60000 });
		await shot('features-list');

		// "Create Feature" is only the empty-state label; with features listed the button is "Add".
		// Create Feature opens a full page, not a drawer.
		await page.getByRole('button', { name: 'Add', exact: true }).click();
		await page.getByText('Create Feature', { exact: true }).first().waitFor();
		await page.getByPlaceholder('Enter a name for the feature').fill('GPT Tokens');
		await choose(page, 'Type', 'Metered');
		// Unit names sit behind a button; typing the singular fills in the plural.
		await page.getByRole('button', { name: 'Unit Name', exact: true }).click();
		await page.getByPlaceholder('millisecond', { exact: true }).fill('token');
		await page.getByPlaceholder('tokens_total').fill('tokens_total');
		await page.getByPlaceholder('tokens', { exact: true }).fill('tokens');

		// The form is taller than the window, so size the window to end just below Save.
		await shot('create-feature', { fitTo: page.getByRole('button', { name: 'Save', exact: true }) });
	},
};
