// /*
//  * LiskHQ/lisk-service
//  * Copyright © 2021 Lisk Foundation
//  *
//  * See the LICENSE file at the top-level directory of this distribution
//  * for licensing information.
//  *
//  * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
//  * no part of this software, including this file, may be copied, modified,
//  * propagated, or distributed except according to the terms contained in the
//  * LICENSE file.
//  *
//  * Removal or modification of this copyright notice is prohibited.
//  *
//  */
const BluebirdPromise = require('bluebird');

const {
	getIndexedAccountInfo,
	getHexAddressFromPublicKey,
	getBase32AddressFromHex,
	getBase32AddressFromPublicKey,
} = require('./accountUtils');

const {
	dropDuplicates,
} = require('../utils/arrayUtils');

const {
	parseToJSONCompatObj,
} = require('../utils/jsonTools');

const { getAppContext } = require('../utils/appContext');

const normalizeAccount = account => {
	account.address = getBase32AddressFromHex(account.address.toString('hex'));
	account.isDelegate = !(account.dpos && !account.dpos.delegate.username);
	account.isMultisignature = !!(account.keys && account.keys.numberOfSignatures);
	account.token.balance = Number(account.token.balance);
	account.sequence.nonce = Number(account.sequence.nonce);

	if (account.dpos) account.dpos.sentVotes = account.dpos.sentVotes
		.map(vote => {
			vote.delegateAddress = getBase32AddressFromHex(vote.delegateAddress.toString('hex'));
			vote.amount = Number(vote.amount);
			return vote;
		});

	return parseToJSONCompatObj(account);
};

const getAccountsFromCore = async (params) => {
	const app = await getAppContext();

	const accounts = {
		data: [],
		meta: {},
	};
	const response = params.addresses
		? await app.requestRpc('connector.getAccounts', params)
		: await app.requestRpc('connector.getAccount', params);

	if (response) {
		accounts.data = [normalizeAccount(response)];
	}
	if (response.meta) accounts.meta = response.meta;
	return accounts;
};

const getAccountsByAddress = async (addressesToIndex, isGenesisBlockAccount = false) => {
	const accounts = await BluebirdPromise.map(
		dropDuplicates(addressesToIndex),
		async address => {
			const { data: [account] } = await getAccountsFromCore({ address });
			if (isGenesisBlockAccount) account.isGenesisAccount = true;

			const accountFromDB = await getIndexedAccountInfo({ address, limit: 1 }, ['publicKey', 'isGenesisAccount']);
			if (accountFromDB) {
				if (accountFromDB.publicKey) account.publicKey = accountFromDB.publicKey;
				if (accountFromDB.isGenesisAccount) {
					account.isGenesisAccount = accountFromDB.isGenesisAccount;
				}
			}
			account.username = account.dpos.delegate.username || null;
			account.totalVotesReceived = account.dpos.delegate.totalVotesReceived;
			account.balance = account.token.balance;
			return account;
		},
		{ concurrency: 10 },
	);
	return accounts;
};

const getAccountsByPublicKey = async (accountInfoArray) => {
	const accounts = await BluebirdPromise.map(
		accountInfoArray
			.map(accountInfo => getHexAddressFromPublicKey(accountInfo.publicKey)),
		async address => {
			const { data: [account] } = await getAccountsFromCore({ address });
			const [accountInfo] = accountInfoArray
				.filter(accInfo => getBase32AddressFromPublicKey(accInfo.publicKey) === account.address);
			account.publicKey = accountInfo.publicKey;
			account.username = account.dpos.delegate.username || null;
			account.totalVotesReceived = account.dpos.delegate.totalVotesReceived;
			account.balance = account.token.balance;
			return account;
		},
		{ concurrency: 10 },
	);
	return accounts;
};

const getAccountsByPublicKey2 = async (accountInfoArray) => {
	const accounts = await BluebirdPromise.map(
		accountInfoArray
			.map(accountInfo => getHexAddressFromPublicKey(accountInfo.publicKey)),
		async address => {
			const { data: [account] } = await getAccountsFromCore({ address });
			const [accountInfo] = accountInfoArray
				.filter(accInfo => getBase32AddressFromPublicKey(accInfo.publicKey) === account.address);
			account.publicKey = accountInfo.publicKey;
			account.username = account.dpos.delegate.username || null;
			account.totalVotesReceived = account.dpos.delegate.totalVotesReceived;
			account.balance = account.token.balance;
			return account;
		},
		{ concurrency: 10 },
	);
	return accounts;
};

const resolveMultisignatureMemberships = tx => {
	const multisignatureInfoToIndex = [];
	const allKeys = tx.asset.mandatoryKeys.concat(tx.asset.optionalKeys);

	allKeys.forEach(key => {
		const members = {
			id: getBase32AddressFromPublicKey(tx.senderPublicKey)
				.concat('_', getBase32AddressFromPublicKey(key)),
			memberAddress: getBase32AddressFromPublicKey(key),
			groupAddress: getBase32AddressFromPublicKey(tx.senderPublicKey),
		};
		multisignatureInfoToIndex.push(members);
	});

	return multisignatureInfoToIndex;
};

module.exports = {
	getAccountsByAddress,
	getAccountsByPublicKey,
	getAccountsByPublicKey2,
	resolveMultisignatureMemberships,
};
