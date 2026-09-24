// Mock Flexprice API for docs screenshots. Answers every request the dashboard makes, so the
// real frontend renders without a backend, a login, or any real account data.

// Example data shared by every docs screenshot. The tenant and environment IDs already appear
// in the docs; the email is a placeholder, never a real person's address.
const EXAMPLE = {
	apiHost: 'api.cloud.flexprice.io',
	tenantId: 'tenant_01K1TJDVNSN7TWY8CZY870QMNV',
	environmentId: 'env_01K1TJJF0CJR410C6QVPYQTNV0',
	tenantName: 'Acme Inc',
	environmentName: 'Sandbox',
	userId: 'user_01K1TJDVNSN7TWY8CZY870QMNW',
	userEmail: 'docs@example.com',
	userName: 'Docs Demo',
	now: '2026-09-24T10:00:00Z',
};

function exampleUser() {
	return {
		id: EXAMPLE.userId,
		email: EXAMPLE.userEmail,
		name: EXAMPLE.userName,
		type: 'user',
		// super_admin plus the '*' role below makes every can(entity, action) check pass,
		// so write-gated buttons such as "Add a connection" are enabled.
		roles: ['super_admin'],
		tenant: {
			id: EXAMPLE.tenantId,
			name: EXAMPLE.tenantName,
			billing_details: {
				address: { address_line1: '', address_line2: '', address_city: '', address_state: '', address_postal_code: '', address_country: 'US' },
			},
			status: 'published',
			metadata: { onboarding_completed: 'true' },
			created_at: EXAMPLE.now,
			updated_at: EXAMPLE.now,
		},
	};
}

// Shape of the dashboard's paginated list responses ({ items, pagination }).
function listResponse(items) {
	return { items, pagination: { total: items.length, limit: 50, offset: 0 } };
}

function exampleConnection(fields) {
	return {
		id: `conn_docs_${fields.provider_type}`,
		name: fields.name,
		provider_type: fields.provider_type,
		environment_id: EXAMPLE.environmentId,
		tenant_id: EXAMPLE.tenantId,
		connection_status: 'published',
		status: 'published',
		sync_config: fields.sync_config || {},
		metadata: fields.metadata || {},
		created_at: EXAMPLE.now,
		updated_at: EXAMPLE.now,
		created_by: EXAMPLE.userId,
		updated_by: EXAMPLE.userId,
	};
}

/**
 * routes: extra handlers checked before the defaults, for pages that need more data:
 *   { method: 'POST', path: '/customers/search' | /^\/customers\/[^/]+$/,
 *     respond: ({ url, body, state, listResponse, example }) => responseBody }
 * connections: connections that already exist when the page loads.
 */
function createMockApi({ appOrigin, routes = [], connections = [] }) {
	const state = { connections: connections.map(exampleConnection) };
	const calls = [];
	const defaulted = new Set();
	const user = exampleUser();
	const environment = { id: EXAMPLE.environmentId, name: EXAMPLE.environmentName, type: 'development', created_at: EXAMPLE.now, updated_at: EXAMPLE.now };
	const cors = {
		'access-control-allow-origin': appOrigin,
		'access-control-allow-headers': '*',
		'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
	};

	async function handle(route) {
		const req = route.request();
		const url = new URL(req.url());
		const path = url.pathname.replace(/^\/v1/, '');
		const method = req.method();
		calls.push(`${method} ${path}${url.search}`);
		const reply = (body, status = 200) => route.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(body) });
		if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });

		let body = null;
		try {
			body = req.postDataJSON();
		} catch {
			body = null;
		}
		for (const r of routes) {
			const pathMatches = typeof r.path === 'string' ? r.path === path : r.path.test(path);
			if ((r.method || 'GET') === method && pathMatches) return reply(await r.respond({ url, body, state, listResponse, example: EXAMPLE }));
		}

		if (path === '/users/me') return reply(user);
		if (path.startsWith('/rbac/roles')) return reply({ roles: [{ id: 'super_admin', name: 'Super Admin', description: 'Full access', permissions: { '*': ['*'] } }] });
		if (path === '/environments' && method === 'GET') return reply({ environments: [environment], total: 1, limit: 50, offset: 0 });
		if (path === `/environments/${EXAMPLE.environmentId}`) return reply(environment);

		if (path === '/connections' && method === 'GET') {
			const provider = url.searchParams.get('provider_type');
			const list = provider ? state.connections.filter((c) => c.provider_type === provider) : state.connections;
			return reply({ connections: list, total: list.length, limit: 50, offset: 0 });
		}
		if (path === '/connections' && method === 'POST') {
			const created = exampleConnection(body || {});
			state.connections = state.connections.filter((c) => c.provider_type !== created.provider_type).concat(created);
			return reply(created);
		}
		const byId = path.match(/^\/connections\/([^/]+)$/);
		if (byId) {
			const existing = state.connections.find((c) => c.id === byId[1]);
			if (method === 'GET') return reply(existing || {}, existing ? 200 : 404);
			if (method === 'PUT' && existing) {
				Object.assign(existing, { name: body?.name || existing.name, sync_config: body?.sync_config || existing.sync_config });
				return reply(existing);
			}
			if (method === 'DELETE') {
				state.connections = state.connections.filter((c) => c.id !== byId[1]);
				return reply({});
			}
		}

		// Anything else gets an empty list. The runner prints these paths: if a page renders empty
		// or broken, add a `routes` entry for the endpoint it needs.
		defaulted.add(`${method} ${path}`);
		return reply(listResponse([]));
	}

	return { handle, calls, defaulted, state, user };
}

module.exports = { EXAMPLE, createMockApi, exampleConnection, listResponse };
