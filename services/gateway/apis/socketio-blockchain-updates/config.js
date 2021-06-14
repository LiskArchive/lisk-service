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
	apiType: 'socket.io-subscribe',
	path: '/blockchain',
	events: [
		{
			name: 'update.moleculer.test',
			type: 'event',
			cache: false,
			params: {
				limit: 1,
			},
			source: {
				endpoint: 'moleculer',
				event: 'event.hello',
				mapper: {
					data: ['data'],
					count: { count: 'meta.count' },
				},
			},
		},
		{
			name: 'update.block',
			type: 'event',
			cache: false,
			params: {
				limit: 1,
			},
			source: {
				endpoint: 'moleculer',
				event: 'blocks.change',
				mapper: {
					data: [require('./mappers/socketBlock')],
					meta: {},
				},
			},
		},
		{
			name: 'update.transactions.unconfirmed',
			type: 'event',
			cache: false,
			source: {
				endpoint: 'moleculer',
				event: 'transactions.change',
				mapper: {
					data: [require('./mappers/socketUnconfirmedTransaction')],
					meta: {},
				},
			},
		},
		{
			name: 'update.transactions',
			type: 'event',
			cache: false,
			source: {
				endpoint: 'moleculer',
				event: 'transactions.new',
				mapper: {
					data: ['data', require('./mappers/socketNewTransactions')],
					meta: {},
				},
			},
		},
		{
			name: 'update.round',
			type: 'event',
			cache: false,
			source: {
				endpoint: 'moleculer',
				event: 'rounds.change',
				mapper: {
					data: [require('./mappers/socketRound')],
					meta: {},
				},
			},
		},
		{
			name: 'update.forgers',
			type: 'event',
			cache: false,
			source: {
				endpoint: 'moleculer',
				event: 'forgers.change',
				mapper: {
					data: [require('./mappers/socketDelegate')],
					meta: {},
				},
			},
		},
	],
};
