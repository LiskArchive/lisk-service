/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
		http: { url: '/api/v1/accounts' },
		rpc: { method: 'get.accounts' },
	},
	{
		http: { url: '/api/v1/account/16313739661670634666L' },
		rpc: { method: 'get.accounts', params: { address: '16313739661670634666L' } },
	},
	{
		http: { url: '/api/v1/account/16313739661670634666L/votes' },
		rpc: { method: 'get.votes' },
		commonParams: { account_id: '16313739661670634666L' },
	},
	{
		http: { url: '/api/v1/account/1081724521551096934L/voters' },
		rpc: { method: 'get.voters' },
		commonParams: { account_id: '1081724521551096934L' },
	},
	{
		http: { url: '/api/v1/blocks' },
		rpc: { method: 'get.blocks' },
	},
	{
		http: { url: '/api/v1/delegates' },
		rpc: { method: 'get.delegates' },
	},
	{
		http: { url: '/api/v1/delegates/next_forgers' },
		rpc: { method: 'get.next_forgers' },
	},
	{
		http: { url: '/api/v1/transactions' },
		rpc: { method: 'get.transactions' },
		commonParams: {},
	},
	{
		http: { url: '/api/v1/transactions' },
		rpc: { method: 'get.transactions' },
		commonParams: { type: 1 },
	},
	{
		http: { url: '/api/v1/transactions' },
		rpc: { method: 'get.transactions' },
		commonParams: { limit: 1 },
	},
	{
		http: { url: '/api/v1/transactions' },
		rpc: { method: 'get.transactions' },
		commonParams: { offset: 1 },
	},
	{
		http: { url: '/api/v1/transactions' },
		rpc: { method: 'get.transactions' },
		commonParams: { block: '5345792228665080891' },
	},
	{
		http: { url: '/api/v1/transactions' },
		rpc: { method: 'get.transactions' },
		commonParams: { id: '3634383815892709956' },
	},
	{
		http: { url: '/api/v1/transactions/statistics/day' },
		rpc: { method: 'get.transactions.statistics.day' },
		commonParams: {},
	},
	{
		http: { url: '/api/v1/transactions/statistics/day' },
		rpc: { method: 'get.transactions.statistics.day' },
		commonParams: { limit: 1, offset: 2 },
	},
	{
		http: { url: '/api/v1/transactions/statistics/month' },
		rpc: { method: 'get.transactions.statistics.month' },
		commonParams: {},
	},
	{
		http: { url: '/api/v1/transactions/statistics/month' },
		rpc: { method: 'get.transactions.statistics.month' },
		commonParams: { limit: 1, offset: 2 },
	},
	{
		http: { url: '/api/v1/search' },
		rpc: { method: 'get.search' },
		commonParams: { q: 'genesis_1' },
	},
	{
		http: { url: '/api/v1/search' },
		rpc: { method: 'get.search' },
		commonParams: { q: '3634383815892709956' },
	},
	{
		http: { url: '/api/v1/network/status' },
		rpc: { method: 'get.network.status' },
		commonParams: {},
	},
	{
		http: { url: '/api/v1/network/statistics' },
		rpc: { method: 'get.network.statistics' },
		commonParams: {},
	},
	{
		http: { url: '/api/v1/peers' },
		rpc: { method: 'get.peers' },
		commonParams: {},
	},
];
