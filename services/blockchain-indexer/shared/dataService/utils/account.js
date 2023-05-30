/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
		getLisk32AddressFromAddress,
		getAddressFromLisk32Address,
	},
	legacyAddress: {
		getLegacyAddressFromPublicKey,

	},
} = require('@liskhq/lisk-cryptography');

const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const accountsTableSchema = require('../../database/schema/accounts');
const config = require('../../../config');
const regex = require('../../regex');

const MYSQL_ENDPOINT_REPLICA = config.endpoints.mysqlReplica;

const getAccountsTable = () => getTableInstance(
	accountsTableSchema.tableName,
	accountsTableSchema,
	MYSQL_ENDPOINT_REPLICA,
);

const getIndexedAccountInfo = async (params, columns) => {
	if (!('publicKey' in params) || params.publicKey) {
		const accountsTable = await getAccountsTable();
		const [account = {}] = await accountsTable.find({ limit: 1, ...params }, columns);
		return account;
	}
	return {};
};

const getLegacyFormatAddressFromPublicKey = publicKey => {
	const legacyAddress = getLegacyAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
	return legacyAddress;
};

const getLisk32AddressFromHexAddress = address => getLisk32AddressFromAddress(Buffer.from(address, 'hex'));

const getLisk32Address = address => address.startsWith('lsk') ? address : getLisk32AddressFromHexAddress(address);

const getHexAddress = address => address.startsWith('lsk')
	? getAddressFromLisk32Address(address).toString('hex')
	: address;

const isStringType = value => typeof value === 'string';

const parseAddress = address => isStringType(address) ? address.toUpperCase() : '';

const validateLisk32Address = address => (typeof address === 'string' && regex.ADDRESS_LISK32.test(address));

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
	getIndexedAccountInfo,
	getLegacyAddressFromPublicKey: getLegacyFormatAddressFromPublicKey,
	getLisk32AddressFromHexAddress,
	getLisk32Address,
	getHexAddress,
	getAccountsTable,
};
