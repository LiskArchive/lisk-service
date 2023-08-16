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
const { Logger } = require('lisk-service-framework');
const { requestConnector } = require('../../../utils/request');

const logger = Logger();

let moduleConstants;

const getNFTConstants = async () => {
	try {
		if (typeof moduleConstants === 'undefined') moduleConstants = await requestConnector('getNFTConstants');
	} catch (err) {
		const errMessage = `Unable to fetch the NFT constants from connector due to: ${err.message}.`;
		logger.warn(errMessage);
		logger.trace(err.stack);
		throw new Error(errMessage);
	}

	return {
		data: moduleConstants,
		meta: {},
	};
};

module.exports = {
	getNFTConstants,
};
