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
	CacheRedis,
	Exceptions: {
		NotFoundException,
		ValidationException,
	},
} = require('lisk-service-framework');

const {
	validateAddress,
	validatePublicKey,
	confirmPublicKey,
	getIndexedAccountInfo,
	getAccountsBySearch,
	getLegacyHexAddressFromPublicKey,
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
	dropDuplicates,
} = require('../../../arrayUtils');

const {
	parseToJSONCompatObj,
} = require('../../../jsonTools');

const {
	standardizeUnlockHeight,
	standardizePomHeight,
} = require('./dpos');

const coreApi = require('./coreApi');
const config = require('../../../../config');
const Signals = require('../../../signals');

const mysqlIndex = require('../../../indexdb/mysql');

const accountsIndexSchema = require('./schema/accounts');
const blocksIndexSchema = require('./schema/blocks');
const multisignatureIndexSchema = require('./schema/multisignature');
const transactionsIndexSchema = require('./schema/transactions');

const getAccountsIndex = () => mysqlIndex('accounts', accountsIndexSchema);
const getBlocksIndex = () => mysqlIndex('blocks', blocksIndexSchema);
const getMultisignatureIndex = () => mysqlIndex('multisignature', multisignatureIndexSchema);
const getTransactionsIndex = () => mysqlIndex('transactions', transactionsIndexSchema);

const accountsCache = CacheRedis('accounts', config.endpoints.volatileRedis);
const legacyAccountCache = CacheRedis('legacyAccount', config.endpoints.redis);
const latestBlockCache = CacheRedis('latestBlock', config.endpoints.redis);

// A boolean mapping against the genesis account addresses to indicate migration status
const isGenesisAccountCache = CacheRedis('isGenesisAccount', config.endpoints.redis);

const requestApi = coreApi.requestRetry;

const isItGenesisAccount = async address => (await isGenesisAccountCache.get(address)) === true;

const indexAccounts = async job => {
	const { accounts } = job.data;
	const accountsDB = await getAccountsIndex();
	accounts.forEach(account => {
		account.username = account.dpos.delegate.username || null;
		account.totalVotesReceived = account.dpos.delegate.totalVotesReceived;
		account.balance = account.token.balance;
		return account;
	});
	await accountsDB.upsert(accounts);
};

const indexAccountsQueue = initializeQueue('indexAccountsQueue', indexAccounts);
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
		? await requestApi(coreApi.getAccountsByAddresses, params.addresses)
		: await requestApi(coreApi.getAccountByAddress, params.address);

	if (response.data) {
		accounts.data = response.data.map(account => normalizeAccount(account));

		await BluebirdPromise.map(
			accounts.data,
			async account => accountsCache.set(account.address, JSON.stringify(account)),
			{ concurrency: accounts.data.length },
		);
	}
	if (response.meta) accounts.meta = response.meta;
	return accounts;
};

const getAccountsFromCache = async (params) => {
	const accounts = {
		data: [],
		meta: {},
	};

	const addresses = params.addresses || [params.address];
	accounts.data = await BluebirdPromise.map(
		addresses,
		async (address) => {
			const accountString = await accountsCache.get(getBase32AddressFromHex(address));
			if (accountString) return JSON.parse(accountString);

			// Fetch account information from Core, if not present in cache
			const { data: [account] } = await getAccountsFromCore({ address });
			return account;
		},
		{ concurrency: 10 },
	);
	return accounts;
};

const indexAccountsbyAddress = async (addressesToIndex, isGenesisBlockAccount = false) => {
	const finalAccountsToIndex = await BluebirdPromise.map(
		dropDuplicates(addressesToIndex),
		async address => {
			const { data: [account] } = await getAccountsFromCore({ address });

			// A genesis block account is considered migrated
			if (isGenesisBlockAccount) await isGenesisAccountCache.set(address, true);
			const accountFromDB = await getIndexedAccountInfo({ address, limit: 1 }, ['publicKey']);
			if (accountFromDB && accountFromDB.publicKey) account.publicKey = accountFromDB.publicKey;
			return account;
		},
		{ concurrency: 10 },
	);

	const PAGE_SIZE = 100;
	const NUM_PAGES = Math.ceil(finalAccountsToIndex.length / PAGE_SIZE);
	for (let i = 0; i < NUM_PAGES; i++) {
		// eslint-disable-next-line no-await-in-loop
		await indexAccountsByAddressQueue.add('indexAccountsByAddressQueue', {
			accounts: finalAccountsToIndex.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
		});
	}
};

const resolveAccountInfo = async accounts => BluebirdPromise.map(
	accounts,
	async account => {
		account.dpos.unlocking = await BluebirdPromise.map(
			account.dpos.unlocking
				.sort((a, b) => b - a)
				.slice(0, 5),
			async unlock => {
				const delegateHexAddress = unlock.delegateAddress;
				unlock.delegateAddress = getBase32AddressFromHex(unlock.delegateAddress);

				let delegateAccount = account;
				if (unlock.delegateAddress !== account.address) {
					const {
						data: [delegateAcc],
					} = await getAccountsFromCache({ address: delegateHexAddress });
					delegateAccount = delegateAcc;
				}
				unlock.height = standardizeUnlockHeight(unlock, account, delegateAccount);

				return unlock;
			},
			{ concurrency: 1 },
		);
		return account;
	},
	{ concurrency: accounts.length },
);

const verifyIfPunished = async delegate => {
	const latestBlockString = await latestBlockCache.get('latestBlock');
	const latestBlock = latestBlockString ? JSON.parse(latestBlockString) : {};
	const isPunished = delegate.pomHeights
		.some(pomHeight => pomHeight.start <= latestBlock.height
			&& latestBlock.height <= pomHeight.end);
	return isPunished;
};

const resolveDelegateInfo = async accounts => {
	accounts = await BluebirdPromise.map(
		accounts,
		async account => {
			if (account.isDelegate) {
				const blocksDB = await getBlocksIndex();
				const transactionsDB = await getTransactionsIndex();
				const delegateRegTxModuleAssetId = '5:0';

				account.account = {
					address: account.address,
					publicKey: account.publicKey,
				};

				account.username = account.dpos.delegate.username;
				account.balance = account.token.balance;
				account.pomHeights = account.dpos.delegate.pomHeights
					.sort((a, b) => b - a)
					.slice(0, 5)
					.map(pomHeight => standardizePomHeight(pomHeight));

				if (account.dpos.delegate.isBanned || await verifyIfPunished(account)) {
					account.delegateWeight = BigInt('0');
				} else {
					const selfVote = account.dpos.sentVotes
						.find(vote => vote.delegateAddress === account.address);
					const selfVoteAmount = selfVote ? BigInt(selfVote.amount) : BigInt(0);
					const cap = selfVoteAmount * BigInt(10);

					account.totalVotesReceived = BigInt(account.dpos.delegate.totalVotesReceived);
					const voteWeight = BigInt(account.totalVotesReceived) > cap
						? cap
						: account.totalVotesReceived;

					account.delegateWeight = voteWeight;
				}

				const [lastForgedBlock = {}] = await blocksDB.find({
					generatorPublicKey: account.publicKey,
					sort: 'height:desc',
					limit: 1,
				}, ['height']);
				account.dpos.delegate.lastForgedHeight = lastForgedBlock.height || null;

				// Iff the COMPLETE blockchain is SUCCESSFULLY indexed
				if (getIsSyncFullBlockchain() && getIndexReadyStatus()) {
					const accountInfo = account.publicKey
						? await getIndexedAccountInfo(
							{
								publicKey: account.publicKey,
								limit: 1,
							},
							['rewards', 'producedBlocks'],
						)
						: {};
					account.rewards = accountInfo && accountInfo.rewards
						? accountInfo.rewards
						: 0;
					account.producedBlocks = accountInfo && accountInfo.producedBlocks
						? accountInfo.producedBlocks
						: 0;

					// Check for the delegate registration transaction
					const [delegateRegTx = {}] = await transactionsDB.find({
						senderPublicKey: account.publicKey,
						moduleAssetId: delegateRegTxModuleAssetId,
						limit: 1,
					}, ['height']);
					account.dpos.delegate.registrationHeight = delegateRegTx.height
						? delegateRegTx.height
						: (await isItGenesisAccount(account.address)) && (await coreApi.getGenesisHeight());
				}
			}
			return account;
		},
		{ concurrency: accounts.length },
	);

	return accounts;
};

const indexAccountsbyPublicKey = async (accountInfoArray) => {
	const accountsDB = await getAccountsIndex();
	const finalAccountsToIndex = await BluebirdPromise.map(
		accountInfoArray
			.map(accountInfo => getHexAddressFromPublicKey(accountInfo.publicKey)),
		async address => {
			const { data: [account] } = await getAccountsFromCore({ address });
			const [accountInfo] = accountInfoArray
				.filter(accInfo => getBase32AddressFromPublicKey(accInfo.publicKey) === account.address);
			account.publicKey = accountInfo.publicKey;
			if (accountInfo.isForger && (!accountInfo.isBlockIndexed || accountInfo.isDeleteBlock)) {
				accountsDB.increment({
					increment: {
						rewards: BigInt(accountInfo.reward * (accountInfo.isDeleteBlock ? -1 : 1)),
						producedBlocks: accountInfo.isDeleteBlock ? -1 : 1,
					},
					where: {
						property: 'address',
						value: account.address,
					},
				}, {
					...account,
					balance: account.token.balance,
					username: account.dpos.delegate.username,
					rewards: accountInfo.reward,
					producedBlocks: 1,
					totalVotesReceived: account.dpos.delegate.totalVotesReceived,
				});
			}
			return account;
		},
		{ concurrency: 10 },
	);

	const PAGE_SIZE = 100;
	const NUM_PAGES = Math.ceil(finalAccountsToIndex.length / PAGE_SIZE);
	for (let i = 0; i < NUM_PAGES; i++) {
		// eslint-disable-next-line no-await-in-loop
		await indexAccountsByPublicKeyQueue.add('indexAccountsByPublicKeyQueue', {
			accounts: finalAccountsToIndex.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
		});
	}
};

const getLegacyAccountInfo = async ({ publicKey }) => {
	const legacyAccountInfo = {};

	// Check if the account was already migrated
	const reclaimTxModuleAssetId = '1000:0';
	const transactionsDB = await getTransactionsIndex();
	const [reclaimTx] = await transactionsDB.find({
		senderPublicKey: publicKey,
		moduleAssetId: reclaimTxModuleAssetId,
		limit: 1,
	}, ['id']);

	if (reclaimTx) {
		Object.assign(
			legacyAccountInfo,
			{
				legacyAddress: getLegacyAddressFromPublicKey(publicKey),
				isMigrated: true,
			},
		);
	} else {
		// Fetch legacy account info from the cache or query Core if unavailable
		const legacyHexAddress = getLegacyHexAddressFromPublicKey(publicKey);
		const cachedAccountInfoStr = await legacyAccountCache.get(legacyHexAddress);
		const accountInfo = cachedAccountInfoStr
			? JSON.parse(cachedAccountInfoStr)
			: await requestApi(coreApi.getLegacyAccountInfo, publicKey);

		if (accountInfo && Object.keys(accountInfo).length) {
			if (!cachedAccountInfoStr) {
				await legacyAccountCache.set(legacyHexAddress, JSON.stringify(accountInfo));
			}

			const legacyAddressBuffer = Buffer.from(accountInfo.address, 'hex');
			const legacyAddress = `${legacyAddressBuffer.readBigUInt64BE().toString()}L`;
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
					legacy: {
						...accountInfo,
						address: legacyAddress,
					},
				},
			);
		} else if (!cachedAccountInfoStr) {
			// Cache empty object for accounts for which core returns 'undefined'
			await legacyAccountCache.set(legacyHexAddress, JSON.stringify(legacyAccountInfo));
		}
	}
	return legacyAccountInfo;
};

const getAccounts = async params => {
	const accounts = {
		data: [],
		meta: {},
	};

	let paramPublicKey;
	let addressFromParamPublicKey;
	const accountsDB = await getAccountsIndex();

	if (params.sort && params.sort.includes('rank')) {
		throw new ValidationException('Rank based sorting is supported only for delegates');
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

	if (params.publicKey && typeof params.publicKey === 'string') {
		if (!validatePublicKey(params.publicKey)) return {};

		const { publicKey, ...remParams } = params;
		paramPublicKey = publicKey;
		addressFromParamPublicKey = getBase32AddressFromPublicKey(paramPublicKey);
		params = {
			...remParams,
			address: addressFromParamPublicKey,
		};
	}

	if (params.address && typeof params.address === 'string') {
		if (!validateAddress(params.address)) return {};
	}

	if (params.addresses) {
		const { addresses, ...remParams } = params;
		params = remParams;
		params.whereIn = {
			property: 'address',
			values: addresses,
		};
	}

	const resultSet = await accountsDB.find(params, ['address', 'publicKey', 'username']);
	if (resultSet.length) params.addresses = resultSet
		.map(row => getHexAddressFromBase32(row.address));

	if (params.address) {
		params.address = getHexAddressFromBase32(params.address);
		if (params.addresses) {
			const { address, ...remParams } = params;
			params = remParams;
		}
	}

	if ((params.addresses && params.addresses.length) || params.address) {
		try {
			const response = {};
			const addresses = params.addresses || [params.address];
			response.data = await BluebirdPromise.map(
				addresses,
				async address => {
					const { data: [account] } = await getAccountsFromCache({ address });
					return account;
				},
				{ concurrency: 10 },
			);
			if (response.data.length) accounts.data = response.data;
			if (params.address && 'offset' in params && params.limit) accounts.data = accounts.data.slice(params.offset, params.offset + params.limit);
		} catch (err) {
			if (!(paramPublicKey && (err instanceof NotFoundException || err.message === 'MISSING_ACCOUNT_IN_BLOCKCHAIN'))) return err;
		}
	}

	accounts.data = await BluebirdPromise.map(
		accounts.data,
		async account => {
			const [indexedAccount] = resultSet.filter(acc => acc.address === account.address);
			if (indexedAccount) {
				if (paramPublicKey && indexedAccount.address === addressFromParamPublicKey) {
					account.publicKey = paramPublicKey;
					await indexAccountsQueue.add('indexAccountsQueue', { accounts: [account] });
				} else {
					account.publicKey = indexedAccount.publicKey;
				}
			}

			if (account.publicKey) {
				const isGenesisAccount = await isItGenesisAccount(account.address);
				if (isGenesisAccount) {
					account.isMigrated = isGenesisAccount;
					account.legacyAddress = getLegacyAddressFromPublicKey(account.publicKey);
				} else {
					// Use only dynamically computed legacyAccount information, ignore the hardcoded info
					const {
						isMigrated,
						legacy,
						legacyAddress,
					} = await getLegacyAccountInfo({ publicKey: account.publicKey });
					Object.assign(account, { isMigrated, legacy, legacyAddress });
				}
			}
			return account;
		},
		{ concurrency: 10 },
	);
	accounts.data = await resolveAccountInfo(accounts.data);
	accounts.data = await resolveDelegateInfo(accounts.data);

	if (paramPublicKey && !accounts.data.length) {
		// Check if reclaim information is available for the account
		const account = {};
		const legacyAccountInfo = await getLegacyAccountInfo({ publicKey: paramPublicKey });
		Object.assign(account, legacyAccountInfo);
		if (Object.keys(account).length) accounts.data.push(account);
	}

	accounts.meta.count = accounts.data.length;
	accounts.meta.offset = params.offset;

	return accounts;
};

const getDelegates = async params => getAccounts({ ...params, isDelegate: true });

const getMultisignatureGroups = async account => {
	const multisignatureAccount = {};
	if (account.keys && account.keys.numberOfSignatures) {
		multisignatureAccount.isMultisignature = true;
		multisignatureAccount.numberOfReqSignatures = account.keys.numberOfSignatures;
		multisignatureAccount.members = [];

		await BluebirdPromise.map(
			account.keys.mandatoryKeys,
			async publicKey => {
				const mandatoryAccount = {
					address: getBase32AddressFromPublicKey(publicKey),
					publicKey,
					isMandatory: true,
				};
				multisignatureAccount.members.push(mandatoryAccount);
			},
			{ concurrency: account.keys.mandatoryKeys.length },
		);
		await BluebirdPromise.map(
			account.keys.optionalKeys,
			async publicKey => {
				const optionalAccount = {
					address: getBase32AddressFromPublicKey(publicKey),
					publicKey,
					isMandatory: false,
				};
				multisignatureAccount.members.push(optionalAccount);
			},
			{ concurrency: account.keys.optionalKeys.length },
		);
	} else multisignatureAccount.isMultisignature = false;
	return multisignatureAccount;
};

const getMultisignatureMemberships = async account => {
	const multisignatureMemberships = { memberships: [] };
	const multisignatureDB = await getMultisignatureIndex();
	const membershipInfo = await multisignatureDB.find({ memberAddress: account.address }, ['groupAddress', 'memberAddress']);

	await BluebirdPromise.map(
		membershipInfo,
		async membership => {
			const result = await getIndexedAccountInfo(
				{ address: membership.groupAddress, limit: 1 },
				['address', 'username', 'publicKey'],
			);
			multisignatureMemberships.memberships.push({
				address: result && result.address ? result.address : undefined,
				username: result && result.username ? result.username : undefined,
				publicKey: result && result.publicKey ? result.publicKey : undefined,
			});
		},
		{ concurrency: membershipInfo.length },
	);

	return multisignatureMemberships;
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

const removeReclaimedLegacyAccountInfoFromCache = () => {
	// Clear the legacyAccount cache when a reclaim transaction has been made
	const removeReclaimedAccountFromCacheListener = async (eventPayload) => {
		const reclaimTxModuleId = 1000;
		const reclaimTxAssetId = 0;

		const [block] = eventPayload.data;
		if (block && block.payload && Array.isArray(block.payload)) {
			await block.payload.forEach(async tx => {
				if (tx.moduleID === reclaimTxModuleId && tx.assetID === reclaimTxAssetId) {
					const legacyHexAddress = getLegacyHexAddressFromPublicKey(tx.senderPublicKey);
					await legacyAccountCache.delete(legacyHexAddress);
				}
			});
		}
	};
	Signals.get('newBlock').add(removeReclaimedAccountFromCacheListener);
};

const keepAccountsCacheUpdated = () => {
	const updateAccountsCacheListener = indexAccountsbyAddress;
	Signals.get('updateAccountsByAddress').add(updateAccountsCacheListener);
};

removeReclaimedLegacyAccountInfoFromCache();
keepAccountsCacheUpdated();

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
	resolveMultisignatureMemberships,
};
