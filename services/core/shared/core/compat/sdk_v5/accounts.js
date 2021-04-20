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

const {
	validatePublicKey,
	confirmAddress,
	confirmPublicKey,
	getIndexedAccountInfo,
	getAccountsBySearch,
	getLegacyAddressFromPublicKey,
	getHexAddressFromPublicKey,
	getBase32AddressFromHex,
	getHexAddressFromBase32,
	getBase32AddressFromPublicKey,
} = require('./accountUtils');

const {
	getIsSyncFullBlockchain,
	getIndexReadyStatus,
} = require('../common');

const {
	initializeQueue,
} = require('../../queue');

const {
	parseToJSONCompatObj,
} = require('../../../jsonTools');

const coreApi = require('./coreApi');

const mysqlIndex = require('../../../indexdb/mysql');

const accountsIndexSchema = require('./schema/accounts');
const transactionsIndexSchema = require('./schema/transactions');

const getAccountsIndex = () => mysqlIndex('accounts', accountsIndexSchema);
const getTransactionsIndex = () => mysqlIndex('transactions', transactionsIndexSchema);

const indexAccounts = async job => {
	const { accounts } = job.data;
	const accountsDB = await getAccountsIndex();
	accounts.forEach(account => {
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

const indexAccountsbyAddress = async (addressesToIndex) => {
	const accountsToIndex = await BluebirdPromise.map(
		addressesToIndex.filter((v, i, a) => a.findIndex(t => (t === v)) === i),
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

const resolveAccountsInfo = async accounts => {
	const balanceUnlockWaitHeightSelf = 260000;
	const balanceUnlockWaitHeightDefault = 2000;

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

const resolveDelegateInfo = async accounts => {
	const punishmentHeight = 780000;
	accounts = await BluebirdPromise.map(
		accounts,
		async account => {
			if (account.isDelegate) {
				account.account = {
					address: account.address,
					publicKey: account.publicKey,
				};

				if (getIsSyncFullBlockchain() && getIndexReadyStatus()) {
					// TODO: Enable after fixing the aggregation issue
					const {
						rewards,
						producedBlocks,
					} = await getIndexedAccountInfo({ publicKey: account.publicKey });
					account.rewards = rewards;
					account.producedBlocks = producedBlocks;
				}

				const adder = (acc, curr) => BigInt(acc) + BigInt(curr.amount);
				const totalVotes = account.dpos.sentVotes.reduce(adder, BigInt(0));
				const selfVote = account.dpos.sentVotes
					.find(vote => vote.delegateAddress === account.address);
				const selfVoteAmount = selfVote ? BigInt(selfVote.amount) : BigInt(0);
				const cap = selfVoteAmount * BigInt(10);

				account.totalVotesReceived = BigInt(account.dpos.delegate.totalVotesReceived);
				const voteWeight = BigInt(totalVotes) > cap ? cap : account.totalVotesReceived;

				account.delegateWeight = voteWeight;
				account.username = account.dpos.delegate.username;
				account.balance = account.token.balance;
				account.pomHeights = account.dpos.delegate.pomHeights
					.sort((a, b) => b - a).slice(0, 5)
					.map(height => ({ start: height, end: height + punishmentHeight }));
			}
			return account;
		},
		{ concurrency: accounts.length },
	);

	return accounts;
};

const indexAccountsbyPublicKey = async (accountInfoArray) => {
	const accountsDB = await getAccountsIndex();
	const accountsToIndex = await BluebirdPromise.map(
		accountInfoArray,
		async accountInfo => {
			const address = getHexAddressFromPublicKey(accountInfo.publicKey);
			const account = (await getAccountsFromCore({ address })).data[0];
			account.publicKey = accountInfo.publicKey;
			if (accountInfo.isForger) {
				await accountsDB.increment({
					increment: {
						rewards: BigInt(accountInfo.reward),
						producedBlocks: 1,
					},
					publicKey: accountInfo.publicKey,
				});
			}
			return account;
		},
		{ concurrency: accountInfoArray.length },
	);
	await indexAccountsByPublicKeyQueue.add('indexAccountsByPublicKeyQueue', { accounts: accountsToIndex });
};

const getLegacyAccountInfo = async ({ publicKey }) => {
	const legacyAccountInfo = {};
	const accountInfo = await coreApi.getLegacyAccountInfo(publicKey);
	if (accountInfo) {
		Object.assign(
			legacyAccountInfo,
			{
				address: getBase32AddressFromPublicKey(publicKey),
				legacyAddress: getLegacyAddressFromPublicKey(publicKey),
				publicKey,
				// The account hasn't migrated/reclaimed yet
				// So, has no outgoing transactions/registrations on the (legacy) blockchain
				isMigrated: false,
				isDelegate: false,
				isMultisignature: false,
				token: { balance: BigInt('0') },
				legacy: accountInfo,
			},
		);
	} else {
		// Check if the account was already migrated
		const reclaimTxModuleAssetId = '1000:0';
		const transactionsDB = await getTransactionsIndex();
		const [reclaimTx] = await transactionsDB.find({
			senderPublicKey: publicKey,
			moduleAssetId: reclaimTxModuleAssetId,
		});
		if (reclaimTx) {
			Object.assign(
				legacyAccountInfo,
				{
					legacyAddress: getLegacyAddressFromPublicKey(publicKey),
					isMigrated: true,
				},
			);
		}
	}
	return legacyAccountInfo;
};

const getAccounts = async params => {
	const accounts = {
		data: [],
		meta: {},
	};
	const accountsDB = await getAccountsIndex();
	if (params.sort && params.sort.includes('rank')) {
		return new Error('Rank based sorting is supported only for delegates');
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
		if (!validatePublicKey(params.publicKey)) {
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
	accounts.data = await resolveDelegateInfo(accounts.data);

	if (params.publicKey) {
		// If available, update legacy account information
		const [account = {}] = accounts.data;
		const legacyAccountInfo = await getLegacyAccountInfo(params);
		Object.assign(account, legacyAccountInfo);
		if (!accounts.data.length) accounts.data.push(account);
	}

	accounts.meta.count = accounts.data.length;
	accounts.meta.offset = params.offset;

	return accounts;
};

const getDelegates = async params => getAccounts({ ...params, isDelegate: true });

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
	confirmPublicKey,
	getAccounts,
	getDelegates,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	indexAccountsbyAddress,
	indexAccountsbyPublicKey,
	getIndexedAccountInfo,
	getAccountsBySearch,
};
