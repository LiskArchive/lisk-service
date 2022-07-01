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
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { getBase32AddressFromPublicKey } = require('../../../utils/accountUtils');
const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;

const accountsIndexSchema = require('../../../database/schema/accounts');

const getAccountsIndex = () => getTableInstance('accounts', accountsIndexSchema, MYSQL_ENDPOINT);

// Command specific constants
const commandID = 4;
const commandName = 'updateGeneratorKey';

// eslint-disable-next-line no-unused-vars
const processTransaction = async (blockHeader, tx, dbTrx) => {
	const accountsDB = await getAccountsIndex();

	const account = {
		address: getBase32AddressFromPublicKey(tx.senderPublicKey),
		publicKey: tx.senderPublicKey,
		generatorKey: tx.params.generatorKey,
	};

	logger.trace(`Updating account index for the account with address ${account.address}`);
	await accountsDB.upsert(account, dbTrx);
	logger.debug(`Updated account index for the account with address ${account.address}`);
};

module.exports = {
	commandID,
	commandName,
	processTransaction,
};
