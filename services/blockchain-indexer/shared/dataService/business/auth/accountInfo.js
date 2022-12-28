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
	getIndexedAccountInfo,
} = require('../../../utils/accountUtils');
const { parseToJSONCompatObj } = require('../../../utils/parser');
const { requestConnector } = require('../../../utils/request');

const getAuthAccountInfo = async params => {
	const authInfo = {
		data: {},
		meta: {},
	};

	const response = await requestConnector('getAuthAccount', { address: params.address });
	authInfo.data = parseToJSONCompatObj(response);

	const accountInfo = await getIndexedAccountInfo({ address: params.address, limit: 1 }, ['name', 'publicKey']);
	authInfo.meta = {
		address: params.address,
		name: accountInfo && accountInfo.name ? accountInfo.name : null,
		publicKey: accountInfo && accountInfo.publicKey ? accountInfo.publicKey : null,
	};

	return authInfo;
};

module.exports = {
	getAuthAccountInfo,
};
