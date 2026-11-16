// Worked example: a data page. Shows the Customers list filled with example customers, then
// the Create customer form captured whole. Produces customers-list and customer-create-form.
//
// The pattern for any page that lists data: find the call in the capture report's "API calls",
// look up the response shape in portal/packages/query and packages/api, and answer it here.
module.exports = {
	routes: ({ listResponse, example }) => {
		const customer = (n, name, email, externalId) => ({
			id: `cust_docs_${n}`,
			name,
			email,
			external_id: externalId,
			address_line1: '',
			address_line2: '',
			address_city: '',
			address_state: '',
			address_postal_code: '',
			address_country: 'US',
			metadata: {},
			status: 'published',
			environment_id: example.environmentId,
			tenant_id: example.tenantId,
			created_at: example.now,
			updated_at: example.now,
			created_by: example.userId,
			updated_by: example.userId,
		});
		const customers = [
			customer(1, 'Northwind Traders', 'billing@northwind.example.com', 'northwind'),
			customer(2, 'Globex Corporation', 'finance@globex.example.com', 'globex'),
			customer(3, 'Initech', 'accounts@initech.example.com', 'initech'),
		];
		return [{ method: 'POST', path: '/customers/search', respond: () => listResponse(customers) }];
	},

	async run({ goto, page, field, shot }) {
		await goto('/customers');
		await page.getByText('Northwind Traders').first().waitFor({ timeout: 60000 });
		await shot('customers-list');

		await page.getByRole('button', { name: 'New customer', exact: true }).click();
		const d = page;
		await field(d, 'Name').waitFor();
		await field(d, 'Name').fill('Hooli');
		await field(d, 'External ID').fill('hooli');
		await field(d, 'Email').fill('billing@hooli.example.com');
		await shot('customer-create-form', { fitTo: page.getByRole('button', { name: 'Create customer', exact: true }) });
	},
};
