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

const getNFTEscrowed = async () => {
	try {
		const escrowedNFTs = await requestConnector('getNFTEscrowed');

		return {
			data: escrowedNFTs,
			meta: {},
		};
	} catch (err) {
		const errMessage = `Unable to fetch escrowed NFTs from connector due to: ${err.message}.`;
		logger.warn(errMessage);
		logger.trace(err.stack);
		throw new Error(errMessage);
	}
};

module.exports = {
	getNFTEscrowed,
};
