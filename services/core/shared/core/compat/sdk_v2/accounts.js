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
const coreApi = require('./coreApi');
const {
	parseAddress,
	confirmAddress,
	validatePublicKey,
	confirmPublicKey,
	confirmSecondPublicKey,
} = require('./index');

const getAccounts = async params => {
	const reqeustParams = {
		limit: params.limit,
		offset: params.offset,
		sort: params.sort,
		username: params.username,
	};

	if (params.address && typeof params.address === 'string') {
		const parsedAddress = parseAddress(params.address);
		if (!await confirmAddress(parsedAddress)) return {};
		reqeustParams.address = parsedAddress;
	}

	if (params.publicKey && typeof params.publicKey === 'string') {
		if (!validatePublicKey(params.publicKey) || (!await confirmPublicKey(params.publicKey))) {
			return {};
		}
		reqeustParams.publicKey = params.publicKey;
	}

	if (params.secondPublicKey && typeof params.secondPublicKey === 'string') {
		if (!validatePublicKey(params.secondPublicKey)
			|| (!await confirmSecondPublicKey(params.secondPublicKey))) {
			return {};
		}
		reqeustParams.secondPublicKey = params.secondPublicKey;
	}

	const result = coreApi.getAccounts(reqeustParams);
	return result;
};


module.exports = { getAccounts };
