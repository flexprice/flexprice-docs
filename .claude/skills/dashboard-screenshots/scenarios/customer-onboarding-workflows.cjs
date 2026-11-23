module.exports = {
	routes: [
		{
			method: 'GET',
			path: '/settings/customer_onboarding',
			respond: () => ({
				id: 'setting_docs_customer_onboarding',
				key: 'customer_onboarding',
				value: {
					workflow_type: 'customer_onboarding',
					actions: [
						{
							action: 'create_wallet',
							currency: 'USD',
							conversion_rate: '1',
							wallet_type: 'PRE_PAID',
							initial_credits_to_load: '2500',
							initial_credits_expiration_duration: null,
							initial_credits_expiration_duration_unit: null,
						},
					],
					custom_workflows: {
						Growth: [
							{
								action: 'create_wallet',
								currency: 'USD',
								conversion_rate: '1',
								wallet_type: 'PRE_PAID',
								initial_credits_to_load: '5000',
								initial_credits_expiration_duration: null,
								initial_credits_expiration_duration_unit: null,
							},
						],
						Enterprise: [
							{
								action: 'create_wallet',
								currency: 'USD',
								conversion_rate: '1',
								wallet_type: 'PRE_PAID',
								initial_credits_to_load: '10000',
								initial_credits_expiration_duration: null,
								initial_credits_expiration_duration_unit: null,
							},
						],
					},
				},
			}),
		},
	],
	async run({ goto, page, shot }) {
		await goto('/settings?section=customer-experience&tab=onboarding');
		await page.getByRole('button', { name: 'New workflow', exact: true }).waitFor({ timeout: 60000 });
		await page.getByText('Growth', { exact: true }).waitFor();
		const dismiss = page.getByRole('button', { name: 'Dismiss', exact: true });
		if (await dismiss.count()) await dismiss.click();
		await shot('customer-onboarding-workflows');
	},
};
