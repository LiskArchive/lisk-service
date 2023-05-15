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
const { MySQL: { getTableInstance } } = require('lisk-service-framework');

const accountsIndexSchema = require('./database/schema/accounts');

const config = require('../config');

const regex = require('./regex');

const isStringType = value => typeof value === 'string';

const parseAddress = address => isStringType(address) ? address.toUpperCase() : '';

const validateLisk32Address = address => (typeof address === 'string' && regex.ADDRESS_LISK32.test(address));

const MYSQL_ENDPOINT_REPLICA = config.endpoints.mysqlReplica;
const getAccountsTable = async () => getTableInstance(
	accountsIndexSchema.tableName,
	accountsIndexSchema,
	MYSQL_ENDPOINT_REPLICA,
);

const getCachedAccountBy = async (key, value) => {
	const accountsTable = await getAccountsTable();
	const [result] = await accountsTable.find({ [key]: value, limit: 1 }, ['address', 'name', 'publicKey']);
	if (!result) return null;
	const { address, name, publicKey } = result;
	const account = { address, name, publicKey };
	return account;
};

const getCachedAccountByAddress = getCachedAccountBy.bind(null, 'address');

const confirmAddress = async address => {
	if (!validateLisk32Address(address)) return false;
	const account = await getCachedAccountByAddress(parseAddress(address));
	return account && account.address;
};

module.exports = {
	confirmAddress,
};
