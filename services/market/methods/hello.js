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
module.exports = [
	{
		name: 'generic.hello',
		description: 'Generic hello function',
		controller: async () => {
			const response = {
				data: [{
					message: 'Hello World!',
				}],
				meta: {
					count: 1,
				},
			};
			return response;
		},
	},
	{
		name: 'parametrized.hello',
		description: 'Hello function with named parameters',
		params: {
			name: { type: 'string', optional: true },
		},
		controller: async param => {
			const response = {
				data: [{
					message: 'Hello World!',
					name: param.name,
				}],
				meta: {
					count: 1,
				},
			};
			return response;
		},
	},
	{
		name: 'asynchronous.hello',
		description: 'Hello function with asynchronous operations',
		controller: () => {
			const request = () => new Promise(resolve => {
				setTimeout(() => {
					resolve({
						data: ['one', 'two', 'three'],
						meta: { count: 3 },
					});
				}, 500);
			});
			return request();
		},
	},
	{
		name: 'server.error',
		description: 'Dummy function throwing a server error',
		controller: async () => {
			throw new Error('Called server.error');
		},
	},
];
