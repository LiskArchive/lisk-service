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
const BluebirdPromise = require('bluebird');

const { Logger, CacheRedis, Signals } = require('lisk-service-framework');
const Transactions = require('@liskhq/lisk-transactions');

const { getLastBlock } = require('./blocks');
const dataService = require('./business');

const {
	getHexAddressFromBase32,
	getBase32AddressFromPublicKey,
	getBase32AddressFromHex,
} = require('../utils/accountUtils');
const { parseToJSONCompatObj } = require('../utils/parser');
const config = require('../../config');

const cacheRedisDelegates = CacheRedis('delegates', config.endpoints.cache);

const logger = Logger();

const delegateStatus = {
	ACTIVE: 'active',
	STANDBY: 'standby',
	BANNED: 'banned',
	PUNISHED: 'punished',
	NON_ELIGIBLE: 'non-eligible', // TODO: Update to 'ineligible' with API v3
};

let rawGenerators = [];
let generatorsList = [];
let delegateList = [];

const delegateComparator = (a, b) => {
	const diff = BigInt(b.delegateWeight) - BigInt(a.delegateWeight);
	if (diff !== BigInt('0')) return Number(diff);
	return Buffer.from(getHexAddressFromBase32(a.address), 'hex')
		.compare(Buffer.from(getHexAddressFromBase32(b.address), 'hex'));
};

const computeDelegateRank = async () => {
	delegateList.sort(delegateComparator);
	delegateList.map((delegate, index) => {
		delegate.rank = index + 1;
		return delegate;
	});
};

const computeDelegateStatus = async () => {
	const numActiveGenerators = await dataService.getNumberOfGenerators();

	const MIN_ELIGIBLE_VOTE_WEIGHT = Transactions.convertLSKToBeddows('1000');

	const lastestBlock = getLastBlock();
	const allGeneratorsAddressList = rawGenerators.map(generator => generator.address);
	const activeGeneratorsList = allGeneratorsAddressList.slice(0, numActiveGenerators);

	const verifyIfPunished = delegate => {
		const isPunished = delegate.pomHeights
			.some(pomHeight => pomHeight.start <= lastestBlock.height
				&& lastestBlock.height <= pomHeight.end);
		return isPunished;
	};

	delegateList.map((delegate) => {
		logger.debug('Determine delegate status');

		// Default delegate status
		delegate.status = delegateStatus.NON_ELIGIBLE;

		// Update delegate status, if applicable
		if (delegate.isBanned) {
			delegate.status = delegateStatus.BANNED;
		} else if (verifyIfPunished(delegate)) {
			delegate.status = delegateStatus.PUNISHED;
		} else if (activeGeneratorsList.includes(delegate.address)) {
			delegate.status = delegateStatus.ACTIVE;
		} else if (BigInt(delegate.delegateWeight) >= BigInt(MIN_ELIGIBLE_VOTE_WEIGHT)) {
			delegate.status = delegateStatus.STANDBY;
		}
		return delegate;
	});
	return delegateList;
};

const loadAllDelegates = async () => {
	try {
		delegateList = await dataService.getAllDelegates();
		await BluebirdPromise.map(
			delegateList,
			async delegate => {
				await cacheRedisDelegates.set(delegate.address, parseToJSONCompatObj(delegate));
				await cacheRedisDelegates.set(delegate.name, parseToJSONCompatObj(delegate));
				return delegate;
			},
			{ concurrency: delegateList.length },
		);

		if (delegateList.length) {
			logger.info(`Updated delegate list with ${delegateList.length} delegates`);
		}
	} catch (err) {
		logger.warn(`Failed to load all delegates due to: ${err.message}`);
	}
};

const loadAllGenerators = async () => {
	const maxCount = await dataService.getNumberOfGenerators();
	rawGenerators = await dataService.getGenerators({
		limit: maxCount,
		offset: generatorsList.length,
	});
	logger.info(`Updated generators list with ${rawGenerators.length} delegates.`);
};

const resolveGenerators = async () => {
	generatorsList = await BluebirdPromise.map(
		rawGenerators,
		async forger => forger,
	);
	logger.debug('Finished collecting delegates');
};

const reloadGeneratorCache = async () => {
	await loadAllGenerators();
	await resolveGenerators();
};

const reload = async () => {
	await loadAllDelegates();
	await loadAllGenerators();
	await computeDelegateRank();
	await computeDelegateStatus();
};

const getAllDelegates = async () => {
	if (delegateList.length === 0) await reload();
	return delegateList;
};

const getTotalNumberOfDelegates = async (params = {}) => {
	const allDelegates = await getAllDelegates();
	const relevantDelegates = allDelegates.filter(delegate => (
		(!params.search || delegate.username.includes(params.search))
		&& (!params.username || delegate.username === params.username)
		&& (!params.address || delegate.account.address === params.address)
		&& (!params.publickey || delegate.account.publicKey === params.publickey)
		&& (!params.secpubkey || delegate.account.secondPublicKey === params.secpubkey)
		&& (!params.status || params.status.includes(delegate.status))
	));
	return relevantDelegates.length;
};

const getGenerators = async params => {
	const generators = {
		data: [],
		meta: {},
	};

	const { offset, limit } = params;

	generators.data = generatorsList.slice(offset, offset + limit);

	generators.meta.count = generators.data.length;
	generators.meta.offset = offset;
	generators.meta.total = generatorsList.length;

	return parseToJSONCompatObj(generators);
};

const getDelegates = async params => {
	const delegates = {
		data: [],
		meta: {},
	};
	const allDelegates = await getAllDelegates();

	const offset = Number(params.offset) || 0;
	const limit = Number(params.limit) || 10;
	if (!params.sort) params.sort = 'rank:asc';

	const sortComparator = (sortParam) => {
		const sortProp = sortParam.split(':')[0];
		const sortOrder = sortParam.split(':')[1];

		const comparator = (a, b) => {
			try {
				if (Number.isNaN(Number(a[sortProp]))) throw new Error('Not a number, try string sorting');
				return (sortOrder === 'asc')
					? a[sortProp] - b[sortProp]
					: b[sortProp] - a[sortProp];
			} catch (_) {
				return (sortOrder === 'asc')
					? a[sortProp].localeCompare(b[sortProp])
					: b[sortProp].localeCompare(a[sortProp]);
			}
		};
		return comparator;
	};

	const filterBy = (list, entity) => list.filter((acc) => params[entity].includes(',')
		? (acc[entity] && params[entity].split(',').includes(acc[entity]))
		: (acc[entity] && acc[entity] === params[entity]),
	);

	delegates.data = allDelegates;

	if (params.address) {
		delegates.data = filterBy(delegates.data, 'address');
	}
	if (params.publicKey) {
		delegates.data = filterBy(delegates.data, 'publicKey');
	}
	if (params.secondPublicKey) {
		delegates.data = filterBy(delegates.data, 'secondPublicKey');
	}
	if (params.username) {
		delegates.data = filterBy(delegates.data, 'username');
	}
	if (params.status) {
		delegates.data = filterBy(delegates.data, 'status');
	}
	if (params.search) {
		delegates.data = delegates.data.filter((acc) => (acc.username
			&& String(acc.username).match(new RegExp(params.search, 'i'))));
	}

	if (delegates.data.every(delegate => !delegate.rank)) await computeDelegateRank();

	delegates.data = delegates.data
		.sort(sortComparator(params.sort))
		.slice(offset, offset + limit);

	delegates.meta.count = delegates.data.length;
	delegates.meta.offset = params.offset;
	delegates.meta.total = await getTotalNumberOfDelegates(params);

	return parseToJSONCompatObj(delegates);
};

// Keep the delegate cache up-to-date
const updateDelegateListEveryBlock = () => {
	const updateDelegateCacheListener = async (eventType, data) => {
		const dposModuleId = 5;
		const registerDelegateAssetId = 0;
		const voteDelegateAssetId = 1;

		const updatedDelegateAddresses = [];
		const [block] = data.data;
		if (block && block.payload && Array.isArray(block.payload)) {
			block.payload.forEach(tx => {
				if (tx.moduleID === dposModuleId) {
					if (tx.assetID === registerDelegateAssetId) {
						updatedDelegateAddresses
							.push(getBase32AddressFromPublicKey(tx.senderPublicKey));
					} else if (tx.assetID === voteDelegateAssetId) {
						tx.asset.votes.forEach(vote => updatedDelegateAddresses
							.push(getBase32AddressFromHex(vote.delegateAddress)));
					}
				}
			});
			if (updatedDelegateAddresses.length) {
				const { data: updatedDelegateAccounts } = await dataService
					.getAccounts({ addresses: updatedDelegateAddresses });

				updatedDelegateAccounts.forEach(delegate => {
					const delegateIndex = delegateList.findIndex(acc => acc.address === delegate.address);
					// Update delegate list on newBlock event
					if (delegate.isDelegate) {
						if (delegateIndex === -1) delegateList.push(delegate);
						else {
							// Re-assign the current delegate status before updating the delegateList
							// Delegate status can change only at the beginning of a new round
							const { status } = delegateList[delegateIndex];
							delegateList[delegateIndex] = { ...delegate, status };
						}
						// Remove delegate from list when deleteBlock event contains delegate registration tx
					} else if (delegateIndex !== -1) {
						delegateList.splice(delegateIndex, 1);
					}
				});

				// Rank is impacted only when a delegate gets (un-)voted
				await computeDelegateRank();
			}

			// Update delegate cache with producedBlocks and rewards
			const delegateIndex = delegateList.findIndex(acc => acc.address === block.generatorAddress);
			if (delegateList[delegateIndex]
				&& Object.getOwnPropertyNames(delegateList[delegateIndex]).length) {
				if (delegateList[delegateIndex].producedBlocks && delegateList[delegateIndex].rewards) {
					delegateList[delegateIndex].producedBlocks = eventType === 'newBlock'
						? delegateList[delegateIndex].producedBlocks + 1
						: delegateList[delegateIndex].producedBlocks - 1;

					delegateList[delegateIndex].rewards = eventType === 'newBlock'
						? (BigInt(delegateList[delegateIndex].rewards) + BigInt(block.reward)).toString()
						: (BigInt(delegateList[delegateIndex].rewards) - BigInt(block.reward)).toString();
				}
			}
		}
	};

	const updateDelegateCacheOnNewBlockListener = (block) => updateDelegateCacheListener('newBlock', block);
	const updateDelegateCacheOnDeleteBlockListener = (block) => updateDelegateCacheListener('deleteBlock', block);

	Signals.get('newBlock').add(updateDelegateCacheOnNewBlockListener);
	Signals.get('deleteBlock').add(updateDelegateCacheOnDeleteBlockListener);
};

// Updates the account details of the delegates
const updateDelegateListOnAccountsUpdate = () => {
	const updateDelegateListOnAccountsUpdateListener = (hexAddresses) => {
		hexAddresses.forEach(async hexAddress => {
			const address = getBase32AddressFromHex(hexAddress);
			const delegateIndex = delegateList.findIndex(acc => acc.address === address);
			const delegate = delegateList[delegateIndex] || {};
			if (Object.getOwnPropertyNames(delegate).length) {
				const {
					data: [updatedDelegate],
				} = await dataService.getDelegates({ address: delegate.address, limit: 1 });

				// Update the account details of the affected delegate
				Object.assign(delegate, parseToJSONCompatObj(updatedDelegate));
			}
		});
	};

	Signals.get('updateAccountState').add(updateDelegateListOnAccountsUpdateListener);
};

updateDelegateListEveryBlock();
updateDelegateListOnAccountsUpdate();

module.exports = {
	reloadDelegateCache: reload,
	getTotalNumberOfDelegates,
	getDelegates,
	reloadGeneratorCache,
	getGenerators,
};
