// Worked example: a list page plus a full-page create form. Shows the Features list with one
// feature of each basic type, then the Create Feature page filled in with the metered example
// from docs/product-catalogue/features (event tokens_total, SUM of tokens).
// Produces features-list and feature-create-form.
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
			feature(1, 'API Calls', 'metered', '2026-09-23T10:00:00Z', { meter_id: 'meter_docs_1', meter: { id: 'meter_docs_1', event_name: 'api_request', aggregation: { type: 'COUNT' } }, unit_singular: 'call', unit_plural: 'calls' }),
			feature(2, 'SAML SSO Authentication', 'boolean', '2026-09-18T10:00:00Z'),
			feature(3, 'Priority Support', 'static', '2026-09-10T10:00:00Z'),
		];
		return [{ method: 'POST', path: '/features/search', respond: () => listResponse(features) }];
	},

	async run({ goto, page, field, choose, shot }) {
		await goto('/features');
		await page.getByText('Priority Support', { exact: true }).first().waitFor({ timeout: 60000 });
		await shot('features-list');
		await page.getByRole('button', { name: 'New feature', exact: true }).click();
		await field(page, 'Name').waitFor();
		await field(page, 'Name').fill('GPT Tokens');
		await page.getByRole('radio', { name: /Metered/ }).check();
		await field(page, 'Event name').fill('tokens_total');
		await choose(page, 'Aggregation', 'Sum');
		await field(page, 'Event field').fill('tokens');
		await shot('feature-create-form', { fitTo: page.locator('form') });
	},
};
