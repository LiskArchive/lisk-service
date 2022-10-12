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
const business = require('../../../shared/dataService/business');

// eslint-disable-next-line no-unused-vars
const getValidator = async params => {
	// const validator = {
	// 	data: {},
	// 	meta: {},
	// };
	// const response = await dataService.getValidator(params);
	// if (response.data) validator.data = response.data;
	// if (response.meta) validator.meta = response.meta;

	const validator = {
		data: {
			generatorKey: '4f3034d6704e8a38098083695822a3da',
			blsKey: '3c95f7931d61909ff092375fc8ad2bc35e393b62d5cca902',
			proofOfPosession: '96c5b026b1030eb73e5dfd9bfe78b0fb35e6bc7add5793fdca3d3e6a1dacb77390e998178b89f80ab8892212838bd5b2',
		},
		meta: {
			address: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
			publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
			name: 'genesis_56',
		},
		links: {},
	};

	return validator;
};

const validateBLSKey = async params => {
	const result = {
		data: {},
		meta: {},
	};
	const response = await business.validateBLSKey(params);
	if (response.data) result.data = response.data;
	if (response.meta) result.meta = response.meta;

	return result;
};

module.exports = {
	getValidator,
	validateBLSKey,
};
