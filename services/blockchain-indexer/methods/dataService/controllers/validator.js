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
const dataService = require('../../../shared/dataService');

const getValidator = async params => {
	const validator = {
		data: {},
		meta: {},
	};
	const response = await dataService.getValidator(params);
	if (response.data) validator.data = response.data;
	if (response.meta) validator.meta = response.meta;

	return validator;
};

const validateBLSKey = async params => {
	const result = {
		data: {},
		meta: {},
	};
	const response = await dataService.validateBLSKey(params);
	if (response.data) result.data = response.data;
	if (response.meta) result.meta = response.meta;

	return result;
};

module.exports = {
	getValidator,
	validateBLSKey,
};
