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
// const dataService = require('../../../shared/dataService');

// eslint-disable-next-line no-unused-vars
const getAuthAccountInfo = async params => {
	// const authInfo = {
	// 	data: {},
	// 	meta: {},
	// };
	// const response = await dataService.getAuthAccountInfo(params);
	// if (response.data) authInfo.data = response.data;
	// if (response.meta) authInfo.meta = response.meta;

	const authInfo = {
		data: {
			nonce: '0',
			numberOfSignatures: 0,
			mandatoryKeys: [],
			optionalKeys: [],
		},
		meta: {
			address: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
			publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
			name: 'genesis_56',
		},
		links: {},
	};

	return authInfo;
};

module.exports = {
	getAuthAccountInfo,
};
