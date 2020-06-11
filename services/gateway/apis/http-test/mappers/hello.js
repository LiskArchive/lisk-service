/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */

module.exports = {
	version: '2.0',
	swaggerApiPath: '/hello/{path_name}',
	envelope: {},
	source: [
		{
			type: 'moleculer',
			method: 'template.parametrized.hello',
			params: {
				name: 'path_name',
			},
			definition: {
				data: ['data', {
					message: '=',
					name: '=',
				}],
				meta: {
					count: 'meta.count,number',
					offset: '=,number',
					total: 'meta.total,number',
				},
				links: {},
			},
		},
		{
			type: 'socketIoRpc',
			endpoint: 'templateRpc',
			method: 'generic.hello',
			params: {
				name: 'path_name',
			},
			definition: {
				name: '=',
			},
		},
		{
			type: 'http',
			endpoint: 'template',
			path: '/api/hello/{name}',
			params: {
				name: 'path_name',
				anotherName: 'name',
				andAnotherName: 'name',
			},
			definition: {
				name: '=',
			},
		},
	],
};
