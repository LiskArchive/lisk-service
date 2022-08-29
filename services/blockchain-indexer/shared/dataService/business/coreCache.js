/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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

const accountsIndexSchema = require('../../database/schema/accounts');

const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAccountsIndex = () => getTableInstance('accounts', accountsIndexSchema, MYSQL_ENDPOINT);

const getCachedAccountBy = async (key, value) => {
	const accountsDB = await getAccountsIndex();
	const [result] = await accountsDB.find({ [key]: value, limit: 1 }, ['address', 'name', 'publicKey']);
	if (!result) return null;
	const { address, name, publicKey } = result;
	const account = { address, name, publicKey };
	return account;
};

const getCachedAccountByAddress = getCachedAccountBy.bind(null, 'address');
const getCachedAccountByPublicKey = getCachedAccountBy.bind(null, 'publicKey');
const getCachedAccountByName = getCachedAccountBy.bind(null, 'name');

module.exports = {
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountByName,
};
