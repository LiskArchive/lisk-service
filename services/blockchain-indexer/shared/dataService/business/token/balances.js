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
	Exceptions: {
		InvalidParamsException,
	},
} = require('lisk-service-framework');

const { requestConnector } = require('../../../utils/request');

const getTokenBalances = async (params) => {
	const tokensInfo = [];
	const tokens = {
		data: [],
		meta: {},
	};

	if (params.tokenID && !params.address) {
		throw new InvalidParamsException('TokenID based retrieval is only possible along with address.');
	}

	if (params.tokenID && params.address) {
		const response = await requestConnector(
			'getTokenBalance',
			{ address: params.address, tokenID: params.tokenID });

		tokensInfo.push({ ...response, tokenID: params.tokenID });
	} else {
		const response = await requestConnector(
			'getTokenBalances',
			{ address: params.address });

		if (response.balances) tokensInfo.push(...response.balances);
	}

	tokens.data = 'offset' in params && 'limit' in params
		? tokensInfo.slice(params.offset, params.offset + params.limit)
		: tokensInfo;

	tokens.meta = {
		address: params.address,
		count: tokens.data.length,
		offset: params.offset,
		total: tokensInfo.length,
	};

	return tokens;
};

module.exports = {
	getTokenBalances,
};
