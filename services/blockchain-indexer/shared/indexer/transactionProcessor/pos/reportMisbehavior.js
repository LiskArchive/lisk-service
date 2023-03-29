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
} = require('lisk-service-framework');
const { reloadValidatorCache } = require('../../../dataService');

const logger = Logger();

// Command specific constants
const COMMAND_NAME = 'reportMisbehavior';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	logger.debug('Reloading validators cache on reportMisbehavior transaction.');
	await reloadValidatorCache();
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	logger.debug('Reloading validators cache on reversal of reportMisbehavior transaction.');
	await reloadValidatorCache();
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
