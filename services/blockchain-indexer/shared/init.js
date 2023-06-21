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
	LoggerConfig,
	Logger,
} = require('lisk-service-framework');

const config = require('../config');

LoggerConfig(config.log);

const { getPosConstants } = require('./dataService/business/pos/constants');

const logger = Logger();

const init = async () => {
	try {
		await getPosConstants();
	} catch (error) {
		const errorMsg = Array.isArray(error)
			? error.map(e => e.message).join('\n')
			: error.message;
		logger.error(`Unable to load pos constants due to: ${errorMsg}`);
	}
};

module.exports = {
	init,
};
