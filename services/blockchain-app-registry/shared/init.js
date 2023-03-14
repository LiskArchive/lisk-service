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
const logger = require('lisk-service-framework').Logger();

const { initDatabase } = require('./database/index');
const { indexAllBlockchainAppsMeta } = require('./metadataIndex');
const { downloadRepositoryToFS } = require('./utils/downloadRepository');

const init = async () => {
	try {
		await initDatabase();
		await downloadRepositoryToFS();
		await indexAllBlockchainAppsMeta();
	} catch (error) {
		let errorMsg = error.message;
		if (Array.isArray(error)) errorMsg = error.map(e => e.message).join('\n');
		logger.error(`Unable to initialize metadata information due to: ${errorMsg}`);
	}
};

module.exports = {
	init,
};
