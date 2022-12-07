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
const { reloadDelegateCache } = require('../../../dataService');

const logger = Logger();

// Command specific constants
const commandName = 'reportDelegateMisbehavior';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, dbTrx) => {
	logger.debug('Reloading delegates cache on reportDelegateMisbehavior transaction');
	await reloadDelegateCache();
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, dbTrx) => {
	logger.debug('Reloading delegates cache on reversal of reportDelegateMisbehavior transaction');
	await reloadDelegateCache();
};

module.exports = {
	commandName,
	applyTransaction,
	revertTransaction,
};