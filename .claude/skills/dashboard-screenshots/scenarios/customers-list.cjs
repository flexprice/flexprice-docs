// Worked example: a data page. Shows the Customers list filled with example customers, then
// the Create Customer drawer captured whole. Produces customers-list and create-customer.
//
// The pattern for any page that lists data: find the call in the capture report's "API calls",
// look up the response shape in flexprice-front/src/api and src/types/dto, and answer it here.
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

	async run({ goto, page, drawer, field, shot }) {
		await goto('/billing/customers');
		await page.getByText('Northwind Traders').first().waitFor({ timeout: 60000 });
		await shot('customers-list');

		// "Create Customer" is only the empty-state label; with customers listed the button is "Add".
		await page.getByRole('button', { name: 'Add', exact: true }).click();
		const d = drawer();
		await d.getByText('Add Customer').first().waitFor();
		// field() finds the input after a label, which works whether or not the input has a placeholder.
		await field(d, 'Name').fill('Hooli');
		await field(d, 'External ID').fill('hooli');
		await field(d, 'Email (Optional)').fill('billing@hooli.example.com');
		await shot('create-customer', { fitDrawer: true });
	},
};
