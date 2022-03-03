/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const { HTTP, Logger } = require('lisk-service-framework');
const config = require('../../../../config');

const logger = Logger('CustomAPI');
const requestLib = HTTP.request;

const liskAddress = config.endpoints.liskHttp;

// HTTP request stack
const validateCoreResponse = body => {
	try {
		if (typeof body === 'object') {
			return true;
		}
		return false;
	} catch (err) {
		return false;
	}
};

const requestGet = (url, params) => new Promise((resolve, reject) => {
	logger.info(`Requesting ${liskAddress}${url}`);
	requestLib(`${liskAddress}${url}`, {
		params,
		timeout: (config.httpTimeout || 15) * 1000, // ms
	}).then(body => {
		if (!body) resolve({});

		let jsonContent;
		try {
			if (typeof body === 'string') jsonContent = JSON.parse(body);
			else jsonContent = body.data;
		} catch (err) {
			logger.error(err.stack);
			return reject(err);
		}

		if (validateCoreResponse(jsonContent)) {
			return resolve(jsonContent);
		}
		return reject(body.error || 'Response was unsuccessful');
	}).catch(err => {
		logger.error(err.stack);
		resolve({});
	});
});

module.exports = {
	get: requestGet,
};
