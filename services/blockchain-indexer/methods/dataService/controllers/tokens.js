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
	Exceptions: { InvalidParamsException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getTokens = async params => {
	try {
		// const tokensInfo = {
		// 	data: [],
		// 	meta: {},
		// }
		// const response = await dataService.getTokens(params);
		// if (response.data) tokensInfo.data = response.data;
		// if (response.meta) tokensInfo.meta = response.meta;

		const tokensInfo = {
			data: [
				{
					tokenID: '2ba563cf98003d',
					name: 'Lisk',
					symbol: 'LSK',
					availableBalance: '5000000',
					lockedBalances: [{
						moduleID: '5',
						amount: '1000000',
					}],
				},
			],
			meta: {
				address: 'lsk6757819470afeb656',
				count: 10,
				offset: params.offset,
				total: 120,
			},
		};

		return tokensInfo;
	} catch (error) {
		let status;
		if (error instanceof InvalidParamsException) status = 'INVALID_PARAMS';
		if (status) return { status, data: { error: error.message } };
		throw error;
	}
};

const getTopLiskAddresses = async params => {
	const topLiskAddresses = {
		data: {},
		meta: {},
	};
	const response = await dataService.getTopLiskAddresses(params);
	if (response.data) topLiskAddresses.data = response.data;
	if (response.meta) topLiskAddresses.meta = response.meta;
};

module.exports = {
	getTokens,
	getTopLiskAddresses,
};
