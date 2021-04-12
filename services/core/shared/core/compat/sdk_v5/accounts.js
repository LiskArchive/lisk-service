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
const { getAddressFromPublicKey, getBase32AddressFromAddress, getAddressFromBase32Address } = require('@liskhq/lisk-cryptography');

const coreApi = require('./coreApi');
const coreCache = require('./coreCache');
const { initializeQueue } = require('../../queue');
const { parseToJSONCompatObj } = require('../../../jsonTools');

const mysqlIndex = require('../../../indexdb/mysql');
const accountsIndexSchema = require('./schema/accounts');

const getAccountsIndex = () => mysqlIndex('accounts', accountsIndexSchema);

const balanceUnlockWaitHeightSelf = 260000;
const balanceUnlockWaitHeightDefault = 2000;

const parseAddress = address => (typeof address === 'string') ? address.toUpperCase() : '';

const validatePublicKey = publicKey => (typeof publicKey === 'string' && publicKey.match(/^([A-Fa-f0-9]{2}){32}$/g));

const confirmAddress = async address => {
	if (!address || typeof address !== 'string') return false;
	const account = await coreCache.getCachedAccountByAddress(address);
	return (account && parseAddress(account.address) === parseAddress(address));
};

const confirmPublicKey = async publicKey => {
	if (!publicKey || typeof publicKey !== 'string') return false;
	const account = await coreCache.getCachedAccountByPublicKey(publicKey);
	return (account && account.publicKey === publicKey);
};

const getIndexedAccountInfo = async params => {
	const accountsDB = await getAccountsIndex();
	const [account] = await accountsDB.find(params);
	return account;
};

const getAccountsBySearch = async (searchProp, searchString) => {
	const accountsDB = await getAccountsIndex();
	const params = {
		search: {
			property: searchProp,
			pattern: searchString,
		},
	};
	const account = await accountsDB.find(params);
	return account;
};

const getHexAddressFromPublicKey = publicKey => {
	const binaryAddress = getAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
	return binaryAddress.toString('hex');
};

const getBase32AddressFromHex = address => {
	const base32Address = getBase32AddressFromAddress(Buffer.from(address, 'hex'));
	return base32Address;
};

const getHexAddressFromBase32 = address => {
	const binaryAddress = getAddressFromBase32Address(address).toString('hex');
	return binaryAddress;
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

const indexAccounts = async job => {
	const { accounts } = job.data;
	const accountsDB = await getAccountsIndex();
	accounts.map(account => {
		account.username = account.dpos.delegate.username || null;
		account.balance = account.token.balance;
		return account;
	});
	await accountsDB.upsert(accounts);
};

const indexAccountsByAddressQueue = initializeQueue('indexAccountsByAddressQueue', indexAccounts);
const indexAccountsByPublicKeyQueue = initializeQueue('indexAccountsByPublicKeyQueue', indexAccounts);

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
	const accounts = {
		data: [],
		meta: {},
	};
	const response = params.addresses
		? await coreApi.getAccountsByAddresses(params.addresses)
		: await coreApi.getAccountByAddress(params.address);
	if (response.data) accounts.data = response.data.map(account => normalizeAccount(account));
	if (response.meta) accounts.meta = response.meta;
	return accounts;
};

const getAccounts = async params => {
	const accounts = {
		data: [],
		meta: {},
	};
	const accountsDB = await getAccountsIndex();
	if (params.sort && params.sort.includes('rank')) {
		return new Error('Rank based sorting is only supported along delegates accounts');
	}
	if (params.search) {
		params.search = {
			property: 'username',
			pattern: params.search,
		};
	}
	if (params.id) {
		const { id, ...remParams } = params;
		params = remParams;
		params.address = id;
	}
	if (params.address && typeof params.address === 'string') {
		if (!(await confirmAddress(params.address))) return {};
	}
	if (params.publicKey && typeof params.publicKey === 'string') {
		if (!validatePublicKey(params.publicKey) || !(await confirmPublicKey(params.publicKey))) {
			return {};
		}
	}
	if (params.addresses) {
		const { addresses, ...remParams } = params;
		params = remParams;
		params.whereIn = {
			property: 'address',
			values: addresses,
		};
	}

	const resultSet = await accountsDB.find(params);
	if (resultSet.length) params.addresses = resultSet
		.map(row => getHexAddressFromBase32(row.address));
	if (params.address || (params.addresses && params.addresses.length)) {
		const response = await getAccountsFromCore(params);
		if (response.data) accounts.data = response.data;
	}
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

	accounts.meta.count = accounts.data.length;
	accounts.meta.offset = params.offset;
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

const indexAccountsbyAddress = async (addressesToIndex) => {
	const accountsToIndex = await BluebirdPromise.map(
		addressesToIndex,
		async address => {
			const accountFromDB = await getIndexedAccountInfo({
				address: getBase32AddressFromHex(address),
			});
			const account = (await getAccountsFromCore({ address })).data[0];
			if (accountFromDB && accountFromDB.publicKey) account.publicKey = accountFromDB.publicKey;
			return account;
		},
		{ concurrency: addressesToIndex.length },
	);
	await indexAccountsByAddressQueue.add('indexAccountsByAddressQueue', { accounts: accountsToIndex });
};

const indexAccountsbyPublicKey = async (publicKeysToIndex) => {
	const accountsToIndex = await BluebirdPromise.map(
		publicKeysToIndex,
		async publicKey => {
			const address = getHexAddressFromPublicKey(publicKey);
			const account = (await getAccountsFromCore({ address })).data[0];
			account.publicKey = publicKey;
			return account;
		},
		{ concurrency: publicKeysToIndex.length },
	);
	await indexAccountsByPublicKeyQueue.add('indexAccountsByPublicKeyQueue', { accounts: accountsToIndex });
};

const getMultisignatureMemberships = async () => []; // TODO

module.exports = {
	getAccounts,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	indexAccountsbyAddress,
	indexAccountsbyPublicKey,
	getIndexedAccountInfo,
	getAccountsBySearch,
	getBase32AddressFromHex,
	getHexAddressFromBase32,
	getHexAddressFromPublicKey,
};
