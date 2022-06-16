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

const { getHexAddressFromBase32 } = require('../../utils/accountUtils');
const { requestConnector } = require('../../utils/request');

const getTokensInfo = async (params) => {
	const tokens = {
		data: [],
		meta: {},
	};

	if (params.tokenID && !params.address) {
		throw new InvalidParamsException('tokenID based retrieval is only possible along with address');
	}

	if (params.tokenID && params.address) {
		const response = await requestConnector('token_getBalance', {
			address: getHexAddressFromBase32(params.address), tokenID: params.tokenID,
		});
		tokens.data = { ...response, tokenID: params.tokenID };
	} else {
		const response = await requestConnector('token_getBalances', {
			address: getHexAddressFromBase32(params.address),
		});
		tokens.data = response.balances;
	}

	tokens.data = Array.isArray(tokens.data) ? tokens.data : [tokens.data];

	tokens.meta = {
		address: params.address,
		count: params.limit,
		offset: params.offset,
		total: tokens.data,
	};

	return tokens;
};

module.exports = {
	getTokensInfo,
};
