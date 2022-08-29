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

const getValidator = async params => {
	const validator = {
		data: {},
		meta: {},
	};

	// TODO: Retrieve validator account info from SDK directly once available
	validator.data = {
		generatorKey: '5b52bc27d3dde5c3ba83e67257e46f51',
		blsKey: '81290d9d37d0495698ba92df44fce9d59c3ec1ddf6ae00c5',
	};

	const accountInfo = await getIndexedAccountInfo({ address: params.address, limit: 1 }, ['name', 'publicKey']);
	validator.meta = {
		address: params.address,
		name: accountInfo && accountInfo.name ? accountInfo.name : null,
		publicKey: accountInfo && accountInfo.publicKey ? accountInfo.publicKey : null,
	};

	return validator;
};

module.exports = {
	getValidator,
};
