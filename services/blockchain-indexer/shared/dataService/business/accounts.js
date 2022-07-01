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
	getLegacyAddressFromPublicKey,
	getBase32AddressFromPublicKey,
} = require('../../utils/accountUtils');

const { requestConnector } = require('../../utils/request');

const getLegacyAccountInfo = async ({ publicKey }) => {
	const legacyAccountInfo = {
		data: {},
		meta: {},
	};

	const response = await requestConnector('legacy_getLegacyAccount', { publicKey });
	legacyAccountInfo.data = {
		address: getBase32AddressFromPublicKey(publicKey),
		legacyAddress: getLegacyAddressFromPublicKey(publicKey),
		balance: response.balance,
	};

	legacyAccountInfo.meta = {
		publicKey,
	};
	return legacyAccountInfo;
};

module.exports = {
	getLegacyAccountInfo,
};
