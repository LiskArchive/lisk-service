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
const { Logger } = require('lisk-service-framework');

const { processTransaction } = require('./module');

const logger = Logger();

const transactionProcessor = async (tx) => {
	try {
		await processTransaction(tx);
	} catch (err) {
		logger.error(`Error occurred while processing transaction for module: ${tx.moduleName} (moduleID: ${tx.moduleID}): \n${err.message}`);
		logger.error(err.stack);
	}
};

// Example invocation
transactionProcessor({
	moduleName: 'Token',
	assetName: 'Transfer',
	moduleID: 2,
	assetID: 0,
	asset: {},
});

module.exports = {
	transactionProcessor,
};
