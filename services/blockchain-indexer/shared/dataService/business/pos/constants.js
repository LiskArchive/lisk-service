/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { Logger, LoggerConfig } = require('lisk-service-framework');
const { requestConnector } = require('../../../utils/request');
const config = require('../../../../config');

LoggerConfig(config.log);
const logger = Logger();

let moduleConstants;

const getPosConstants = async () => {
	try {
		if (typeof moduleConstants === 'undefined') moduleConstants = await requestConnector('getPosConstants');
	} catch (err) {
		const errMessage = `Unable to fetch the PoS constants from connector due to: ${err.message}.`;
		logger.warn(errMessage);
		logger.trace(err.stack);
		throw new Error(errMessage);
	}

	return {
		data: moduleConstants,
		meta: {},
	};
};

const getPosTokenID = async () => {
	const { data: { posTokenID } } = await getPosConstants();
	return posTokenID;
};

module.exports = {
	getPosConstants,
	getPosTokenID,
};
