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
const BluebirdPromise = require('bluebird');

const coreApi = require('./coreApi');
const coreCache = require('./coreCache');
const { knex } = require('../../../database');
const { parseToJSONCompatObj } = require('../common');

const balanceUnlockWaitHeightSelf = 260000;
const balanceUnlockWaitHeightDefault = 2000;

// const parseAddress = address => {
// 	if (typeof address !== 'string') return '';
// 	return address.toUpperCase();
// };

const validateBoolean = val => {
	if (val.toString().match(/^(true|[1-9][0-9]*|[0-9]*[1-9]+|yes)$/i)) return true;
	return false;
};

const validatePublicKey = publicKey => (typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

// const confirmAddress = async address => {
// 	if (!address || typeof address !== 'string') return false;
// 	const account = await coreCache.getCachedAccountByAddress(address);
// 	return (account && parseAddress(account.address) === parseAddress(address));
// };

const confirmPublicKey = async publicKey => {
	if (!publicKey || typeof publicKey !== 'string') return false;
	const account = await coreCache.getCachedAccountByPublicKey(publicKey);
	return (account && account.publicKey === publicKey);
};

const resolveAccountsInfo = async accounts => {
	accounts.map(async account => {
		account.dpos.unlocking = account.dpos.unlocking.map(item => {
			const balanceUnlockWaitHeight = (item.delegateAddress === account.address)
				? balanceUnlockWaitHeightSelf : balanceUnlockWaitHeightDefault;
			item.height = {
				start: item.unvoteHeight,
				end: item.unvoteHeight + balanceUnlockWaitHeight,
			};
			return item;
		});
		return account;
	});
	return accounts;
};

const resolvePublicKeyByAddress = async (address) => {
	const blocksDB = await knex('blocks');
	const transactionsDB = await knex('transactions');
	let [response] = await blocksDB.find({ generatorAddress: address });
	if (!response) [response] = await transactionsDB.find({ senderId: address });
	const publickey = response.generatorPublicKey || response.senderPublicKey;
	return publickey;
};

const indexAccounts = async accounttoIndex => {
	const accountsDB = await knex('accounts');
	const accounts = await BluebirdPromise.map(
		accounttoIndex, async account => {
			const skimmedAccounts = {};
			const publickey = await resolvePublicKeyByAddress(account.address);
			skimmedAccounts.address = account.address;
			skimmedAccounts.publicKey = publickey || null;
			skimmedAccounts.isDelegate = account.isDelegate;
			skimmedAccounts.username = account.dpos.delegate.username || null;
			skimmedAccounts.balance = account.token.balance;
			return skimmedAccounts;
		},
		{ concurrency: accounttoIndex.length },
	);
	await accountsDB.writeBatch(accounts);
};

const normalizeAccount = account => {
	account.address = account.address.toString('hex');
	account.isDelegate = !(account.dpos && account.dpos.delegate.username.length === 0);
	account.isMultisignature = !!(account.keys && account.keys.numberOfSignatures);
	account.token.balance = Number(account.token.balance);
	account.sequence.nonce = Number(account.sequence.nonce);

	if (account.dpos) account.dpos.sentVotes = account.dpos.sentVotes
		.map(vote => {
			vote.delegateAddress = vote.delegateAddress.toString('hex');
			vote.amount = Number(vote.amount);
			return vote;
		});

	return parseToJSONCompatObj(account);
};

const getAccounts = async params => {
	const accountsDB = await knex('accounts');
	const accounts = {
		data: [],
		meta: {},
	};

	// if (params.address && typeof params.address === 'string') {
	// 	if (!(await confirmAddress(params.address))) return {};
	// }
	if (params.publicKey && typeof params.publicKey === 'string') {
		if (!validatePublicKey(params.publicKey) || !(await confirmPublicKey(params.publicKey))) {
			return {};
		}
	}
	if (params.isDelegate) params.isDelegate = validateBoolean(params.isDelegate);
	const resultSet = await accountsDB.find(params);
	if (resultSet.length) params.addresses = resultSet.map(row => row.address);
	const response = await coreApi.getAccounts(params);
	if (response.data) accounts.data = response.data.map(account => normalizeAccount(account));
	if (response.meta) accounts.meta = response.meta;

	accounts.data = await BluebirdPromise.map(
		accounts.data,
		async account => {
			const [indexedAccount] = resultSet.filter(acc => acc.address === account.address);
			if (indexedAccount) account.publicKey = indexedAccount.publicKey;
			return account;
		},
		{ concurrency: accounts.data.length },
	);
	accounts.data = await resolveAccountsInfo(accounts.data);
	indexAccounts(accounts.data);
	return accounts;
};

const getMultisignatureGroups = async account => {
	const multisignatureAccount = {};
	if (account.keys.numberOfSignatures) {
		multisignatureAccount.isMultisignature = true;
		multisignatureAccount.numberOfReqSignatures = account.keys.numberOfSignatures;
		multisignatureAccount.members = [];

		await BluebirdPromise.map(
			account.keys.mandatoryKeys, async publicKey => {
				const accountByPublicKey = (await getAccounts({ publicKey })).data[0];
				accountByPublicKey.isMandatory = true;
				multisignatureAccount.members.push(accountByPublicKey);
			},
			{ concurrency: account.keys.mandatoryKeys.length },
		);
		await BluebirdPromise.map(
			account.keys.optionalKeys, async publicKey => {
				const accountByPublicKey = (await getAccounts({ publicKey })).data[0];
				accountByPublicKey.isMandatory = false;
				multisignatureAccount.members.push(accountByPublicKey);
			},
			{ concurrency: account.keys.optionalKeys.length },
		);
	} else multisignatureAccount.isMultisignature = false;
	return multisignatureAccount;
};

const getMultisignatureMemberships = async () => []; // TODO

module.exports = {
	getAccounts,
	getMultisignatureGroups,
	getMultisignatureMemberships,
};
