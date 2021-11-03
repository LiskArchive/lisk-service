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
const { getTableInstance } = require('../../../indexdb/mysql');
const accountsIndexSchema = require('./schema/accounts');

const getAccountsIndex = () => getTableInstance('accounts', accountsIndexSchema);

const getCachedAccountBy = async (key, value) => {
	const accountsDB = await getAccountsIndex();
	const [result] = await accountsDB.find({ [key]: value, limit: 1 }, ['address', 'username', 'publicKey']);
	if (!result) return null;
	const { address, username, publicKey } = result;
	const account = { address, username, publicKey };
	return account;
};

const getCachedAccountByAddress = getCachedAccountBy.bind(null, 'address');
const getCachedAccountByPublicKey = getCachedAccountBy.bind(null, 'publicKey');
const getCachedAccountBySecondPublicKey = getCachedAccountBy.bind(null, 'secondPublicKey');
const getCachedAccountByUsername = getCachedAccountBy.bind(null, 'username');

module.exports = {
	getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,
};
