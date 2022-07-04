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
// const { HTTP } = require('lisk-service-framework');

// const { StatusCodes: { NOT_FOUND } } = HTTP;

// const dataService = require('../../../shared/dataService');

// const {
// 	confirmAnyId,
// } = require('../../../shared/accountUtils');

const getVotesSent = async params => {
	// const isFound = await confirmAnyId(params);
	// if (!isFound && params.address) {
	// 	return {
	// 		status: NOT_FOUND, data: { error: `Account with address ${params.address} not found.` },
	// 	};
	// }
	// if (!isFound && params.name) {
	// 	return { status: NOT_FOUND, data: { error: `Account with name ${params.name} not found.` } };
	// }

	// const votesSent = {
	// 	data: {},
	// 	meta: {},
	// };

	// const response = await dataService.getVotesSent(params);
	// if (response.data) votesSent.data = response.data;
	// if (response.meta) votesSent.meta = response.meta;

	const votesSent = {
		data: {
			account: {
				address: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
				publicKey: 'aq02qkbb35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
				name: 'genesis_56',
				votesUsed: 10,
			},
			votes: [
				{
					delegateAddress: 'lsk24cd35u4jdq8szo3ptrn47dsxwrnazyhhkg5eu',
					amount: '1081560729258',
					name: 'liskhq',
				},
			],
		},
		meta: {
			count: 10,
			offset: params.offset,
			total: 10,
		},
		links: {},
	};

	return votesSent;
};

module.exports = {
	getVotesSent,
};
