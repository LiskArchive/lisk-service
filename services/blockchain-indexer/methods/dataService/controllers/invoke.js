/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
	HTTP,
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const { StatusCodes: { BAD_REQUEST } } = HTTP;

const dataService = require('../../../shared/dataService');

const invokeEndpoint = async params => {
	try {
		const indexStatus = {
			data: {},
			meta: {},
		};
		const response = await dataService.invokeEndpoint(params);
		if (response.data) indexStatus.data = response.data;
		if (response.meta) indexStatus.meta = response.meta;

		return indexStatus;
	} catch (err) {
		let status;
		if (err instanceof ValidationException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	invokeEndpoint,
};
