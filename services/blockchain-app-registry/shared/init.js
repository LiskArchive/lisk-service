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
const {
	Logger,
	DB: {
		MySQL: {
			getDBConnection,
			startDBTransaction,
			commitDBTransaction,
			rollbackDBTransaction,
		},
	},
} = require('lisk-service-framework');

const logger = Logger();
const { indexAllBlockchainAppsMeta } = require('./metadataIndex');
const { downloadRepositoryToFS } = require('./utils/downloadRepository');

const config = require('../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const init = async () => {
	const dbConnection = await getDBConnection(MYSQL_ENDPOINT);
	const dbTrx = await startDBTransaction(dbConnection);

	try {
		await downloadRepositoryToFS(dbTrx);
		await indexAllBlockchainAppsMeta(dbTrx);
		await commitDBTransaction(dbTrx);
	} catch (error) {
		await rollbackDBTransaction(dbTrx);
		const errorMsg = Array.isArray(error)
			? error.map(e => e.message).join('\n')
			: error.message;
		logger.error(`Unable to initialize metadata information due to: ${errorMsg}.`);
	}
};

module.exports = {
	init,
};
