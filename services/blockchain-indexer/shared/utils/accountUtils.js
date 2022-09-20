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
		getLisk32AddressFromAddress,
	},
	legacyAddress: {
		getLegacyAddressFromPublicKey,

	},
} = require('@liskhq/lisk-cryptography');

const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const accountsIndexSchema = require('../database/schema/accounts');
const config = require('../../config');

const getAccountsIndex = () => getTableInstance('accounts', accountsIndexSchema, config.endpoints.mysql);

const getIndexedAccountInfo = async (params, columns) => {
	if (!('publicKey' in params) || params.publicKey) {
		const accountsDB = await getAccountsIndex();
		const [account = {}] = await accountsDB.find(params, columns);
		return account;
	}
	return {};
};

const getLegacyFormatAddressFromPublicKey = publicKey => {
	const legacyAddress = getLegacyAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
	return legacyAddress;
};

const getLisk32AddressFromPublicKey = publicKey => getLisk32AddressFromPublicKeyHelper(Buffer.from(publicKey, 'hex'));

// TODO: Remove once delegate address is returned in Lisk32 format
const getLisk32AddressFromHexAddress = address => {
	return getLisk32AddressFromAddress(Buffer.from(address, 'hex'));
}

const updateAccountPublicKey = async (publicKey) => {
	const accountsDB = await getAccountsIndex();
	await accountsDB.upsert({
		address: getLisk32AddressFromPublicKey(publicKey),
		publicKey,
	});
};

module.exports = {
	getIndexedAccountInfo,
	getLegacyAddressFromPublicKey: getLegacyFormatAddressFromPublicKey,
	getLisk32AddressFromPublicKey,
	getLisk32AddressFromHexAddress,
	updateAccountPublicKey,
};
