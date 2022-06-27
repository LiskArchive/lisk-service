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
// TODO: Enable when getVotes endpoint works from SDK
// const dataService = require('../../../shared/dataService');

const getUnlocks = async params => {
	// const unlocks = {
	// 	data: {},
	// 	meta: {},
	// };

	// const response = await dataService.getUnlocks(params);
	// if (response.data) unlocks.data = response.data;
	// if (response.meta) unlocks.meta = response.meta;

	const unlocks = {
		data: {
			address: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
			publicKey: 'd5aa0d647b5d9ff0285321d606c870348711266ea8f0df627ef8f39d1c9959c7',
			name: 'genesis_56',
			unlocking: [
				{
					delegateAddress: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
					amount: '10000000',
					unvoteHeight: 30,
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

	return unlocks;
};

module.exports = {
	getUnlocks,
};
