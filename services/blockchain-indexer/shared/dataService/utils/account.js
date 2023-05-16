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

const MYSQL_ENDPOINT_REPLICA = config.endpoints.mysqlReplica;

const getAccountsTable = () => getTableInstance(
	accountsTableSchema.tableName,
	accountsTableSchema,
	MYSQL_ENDPOINT_REPLICA,
);

const getIndexedAccountInfo = async (params, columns) => {
	if (!('publicKey' in params) || params.publicKey) {
		const accountsTable = await getAccountsTable(MYSQL_ENDPOINT_REPLICA);
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

// TODO: Remove once SDK returns address in Lisk32 format
const getLisk32Address = address => address.startsWith('lsk') ? address : getLisk32AddressFromHexAddress(address);

const getHexAddress = address => address.startsWith('lsk')
	? getAddressFromLisk32Address(address).toString('hex')
	: address;

module.exports = {
	getIndexedAccountInfo,
	getLegacyAddressFromPublicKey: getLegacyFormatAddressFromPublicKey,
	getLisk32AddressFromHexAddress,
	getLisk32Address,
	getHexAddress,
	getAccountsTable,
};
