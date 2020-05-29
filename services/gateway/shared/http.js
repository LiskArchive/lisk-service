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
const request = require('request-promise');
const logger = require('../services/logger')();

const errorMsg = {
	400: 'Bad request.',
	403: 'Forbidden',
	404: 'Not found.',
	413: 'Data size exceeds maximum permitted.',
	500: 'Error during data fetch.',
	501: 'Feature not implemented.',
};

const responseStatus = {
	OK: { code: 200 },
	NOT_FOUND: { code: 404 },
	INVALID_PARAMS: { code: 400 },
	LARGE_PAYLOAD: { code: 413 },
	INVALID_RESPONSE: { code: 500 },
	SERVER_ERROR: { code: 500 },
	FORBIDDEN: { code: 403 },
	NOT_IMPLEMENTED: { code: 501 },
};

const response = (res, status, message) => {
	if (status !== 'OK') {
		const msg = 'Internal server error';
		logger.warn(msg);
		logger.warn(message);
		res.status(responseStatus[status].code);
		return res.json({ error: true, message });
	}

	return res.json(message);
};

module.exports = {
	request,
	errorMsg,
	responseStatus,
	response,
	httpResponse: response,
};
