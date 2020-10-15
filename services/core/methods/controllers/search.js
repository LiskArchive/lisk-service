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
const stringSimilarity = require('string-similarity');

const CoreService = require('../../shared/core');

const regex = {
	address: /^[1-9]\d{0,19}L$/,
	publicKey: /^[0-9a-f]{64}$/,
	delegateName: /^[a-z0-9!@$&_.]{1,20}$/,
	transactionId: /^[1-9]\d{0,19}$/,
	blockId: /^[1-9]\d{0,19}$/,
	blockHeight: /^[1-9]\d{0,19}$/,
};

const mapDataItems = (response, mapper) => ({
	...response,
	data: (response.data || []).map(mapper),
});

const mapAddressFields = ({ address }) => ({ id: address, score: 1, type: 'address' });

const mapBlockFields = ({ id, height }) => ({
	id, description: height, score: 1, type: 'block',
});

const searchBy = {
	address: async searchTerm => {
		const response = await CoreService.getAccounts({ address: searchTerm });
		return mapDataItems(response, mapAddressFields);
	},

	publicKey: async searchTerm => {
		const response = await CoreService.getAccounts({ publicKey: searchTerm });
		return mapDataItems(response, mapAddressFields);
	},

	delegateName: async searchTerm => {
		const mapDelegateFields = ({ account, username }) => ({
			id: account.address,
			description: username,
			score: stringSimilarity.compareTwoStrings(searchTerm, username),
			type: 'address',
		});

		const response = await CoreService.getDelegates({
			search: searchTerm,
			sort: 'username:asc',
		});
		return {
			...response,
			data: (response.data || [])
				.map(mapDelegateFields),
		};
	},

	transactionId: async searchTerm => {
		const mapTransactionFields = ({ id }) => ({ id, score: 1, type: 'tx' });

		const response = await CoreService.getTransactions({ id: searchTerm });
		return mapDataItems(response, mapTransactionFields);
	},

	blockId: async searchTerm => {
		const response = await CoreService.getBlocks({ blockId: searchTerm });
		return mapDataItems(response, mapBlockFields);
	},

	blockHeight: async searchTerm => {
		const response = await CoreService.getBlocks({ height: searchTerm });
		return mapDataItems(response, mapBlockFields);
	},
};

const getSearches = searchTerm => (
	Object.keys(searchBy).reduce((accumulator, key) => ([
		...accumulator,
		...(searchTerm.match(regex[key]) ? [searchBy[key]] : []),
	]), [])
);

const resolveAll = (apiCalls, searchTerm) => {
	const promises = apiCalls.map(apiCall => apiCall(searchTerm)
			.catch(err => err));

	return Promise.all(promises)
		.then(results => (results.reduce((accumulator, response) => ({
			data: [...accumulator.data, ...(response.data || [])],
			total: accumulator.total + ((response.meta && response.meta.total) || 0),
		}), { data: [], total: 0 })));
};

const getSearch = async params => {
	const apiCalls = getSearches(params.q);
	const response = await resolveAll(apiCalls, params.q);

	return {
		data: response.data.sort((a, b) => b.score - a.score),
		meta: {
			count: response.data.length,
			total: Math.max(response.total, response.data.length),
		},
	};
};

module.exports = {
	getSearch,
};
