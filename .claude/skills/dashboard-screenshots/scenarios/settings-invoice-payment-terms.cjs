module.exports = {
	routes: () => [
		{
			method: 'GET',
			path: '/settings/invoice_config',
			respond: () => ({
				key: 'invoice_config',
				value: {
					prefix: 'INV',
					format: 'YYYYMM',
					start_sequence: 1,
					timezone: 'UTC',
					separator: '-',
					suffix_length: 5,
					due_date_days: 14,
					payment_terms: '30 NET',
					finalization_delay_seconds: 7200,
					auto_finalize: true,
				},
			}),
		},
	],

	async run({ goto, page, shot }) {
		await goto('/settings?section=invoicing&tab=invoices');
		await page.getByText('Payment due', { exact: true }).waitFor({ timeout: 60000 });
		await page.getByLabel('Days', { exact: true }).waitFor();
		await shot('v2-invoices', { clipTo: page.getByText(/An invoice issued today is due/) });
	},
};
