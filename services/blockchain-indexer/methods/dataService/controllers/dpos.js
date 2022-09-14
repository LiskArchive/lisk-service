/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const {
	HTTP: { StatusCodes: { BAD_REQUEST } },
	Exceptions: { ValidationException, InvalidParamsException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getDelegates = async params => {
	const delegates = {
		data: [],
		meta: {},
	};

	try {
		const response = await dataService.getDelegates(params);
		if (response.data) delegates.data = response.data;
		if (response.meta) delegates.meta = response.meta;

		return delegates;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

const getDPoSConstants = async () => {
	const constants = {
		data: {},
		meta: {},
	};

	const response = await dataService.getDPoSConstants();
	if (response.data) constants.data = response.data;
	if (response.meta) constants.meta = response.meta;

	return constants;
};

const getUnlocks = async params => {
	const unlocks = {
		data: {},
		meta: {},
	};

	const response = await dataService.getUnlocks(params);
	if (response.data) unlocks.data = response.data;
	if (response.meta) unlocks.meta = response.meta;

	return unlocks;
};

// TODO: Remove mocked response once we are able to create vote transactions, also move the import to top

// const { HTTP } = require('lisk-service-framework');
// const { StatusCodes: { NOT_FOUND } } = HTTP;

// const {
// 	confirmAnyId,
// } = require('../../../shared/accountUtils');

const getVotesReceived = async params => {
	// const isFound = await confirmAnyId(params);
	// if (!isFound && params.address) {
	// 	return {
	// 		status: NOT_FOUND, data: { error: `Account with address ${params.address} not found.` }
	// 	}
	// };
	// if (!isFound && params.name) {
	// 	return { status: NOT_FOUND, data: { error: `Account with name ${params.name} not found.` } }
	// }

	// const votesReceived = {
	// 	data: {},
	// 	meta: {},
	// };

	// const response = await dataService.getVotesReceived(params);
	// if (response.data) votesReceived.data = response.data;
	// if (response.meta) votesReceived.meta = response.meta;

	const votesReceived = {
		data: {
			account: {
				address: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
				publicKey: 'aq02qkbb35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
				name: 'genesis_56',
			},
			votes: [
				{
					delegateAddress: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
					amount: '1081560729258',
					name: 'liskhq',
				},
			],
		},
		meta: {
			count: 10,
			offset: params.offset,
			total: 105,
		},
		links: {},
	};

	return votesReceived;
};

const getVotesSent = async params => {
	const votesSent = {
		data: {},
		meta: {},
	};

	const response = await dataService.getVotesSent(params);
	if (response.data) votesSent.data = response.data;
	if (response.meta) votesSent.meta = response.meta;

	return votesSent;
};

module.exports = {
	getDelegates,
	getDPoSConstants,
	getUnlocks,
	getVotesReceived,
	getVotesSent,
};

