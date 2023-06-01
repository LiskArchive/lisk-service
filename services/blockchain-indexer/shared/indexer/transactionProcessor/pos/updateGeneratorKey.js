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

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysqlPrimary;
const accountsTableSchema = require('../../../database/schema/accounts');
const validatorsTableSchema = require('../../../database/schema/validators');

const getAccountsTable = () => getTableInstance(accountsTableSchema, MYSQL_ENDPOINT);
const getValidatorsTable = () => getTableInstance(validatorsTableSchema, MYSQL_ENDPOINT);

// Command specific constants
const COMMAND_NAME = 'updateGeneratorKey';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const accountsTable = await getAccountsTable();
	const validatorsTable = await getValidatorsTable();

	const validator = {
		address: getLisk32AddressFromPublicKey(tx.senderPublicKey),
		publicKey: tx.senderPublicKey,
		isValidator: true,
		generatorKey: tx.params.generatorKey,
	};

	logger.trace(`Updating account index for the account with address ${validator.address}.`);
	await accountsTable.upsert(validator, dbTrx);
	logger.debug(`Updated account index for the account with address ${validator.address}.`);

	logger.trace(`Indexing validator with address ${validator.address}.`);
	await validatorsTable.upsert(validator, dbTrx);
	logger.debug(`Indexed validator with address ${validator.address}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const validatorsTable = await getValidatorsTable();

	const validator = {
		address: getLisk32AddressFromPublicKey(tx.senderPublicKey),
		generatorKey: null,
	};

	logger.trace(`Removing generatorKey for validator with address ${validator.address}.`);
	await validatorsTable.upsert(validator, dbTrx);
	logger.debug(`Removed generatorKey for validator with address ${validator.address}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
