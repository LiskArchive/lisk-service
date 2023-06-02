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
	address: {
		getLisk32AddressFromPublicKey: getLisk32AddressFromPublicKeyHelper,
	},
} = require('@liskhq/lisk-cryptography');

const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const accountsTableSchema = require('../database/schema/accounts');
const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysqlPrimary;

const getAccountsTable = () => getTableInstance(accountsTableSchema, MYSQL_ENDPOINT);

const getLisk32AddressFromPublicKey = publicKey => getLisk32AddressFromPublicKeyHelper(Buffer.from(publicKey, 'hex'));

const updateAccountPublicKey = async (publicKey) => {
	const accountsTable = await getAccountsTable();
	await accountsTable.upsert({
		address: getLisk32AddressFromPublicKey(publicKey),
		publicKey,
	});
};

const updateAccountInfo = async (params) => {
	const accountInfo = {};

	Object.keys(accountsTableSchema.schema).forEach(columnName => {
		if (columnName in params) {
			accountInfo[columnName] = params[columnName];
		}
	});

	const accountsTable = await getAccountsTable();
	await accountsTable.upsert(accountInfo);
};

module.exports = {
	getLisk32AddressFromPublicKey,
	updateAccountPublicKey,
	updateAccountInfo,
};
