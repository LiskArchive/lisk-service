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
const Transactions = require('@liskhq/lisk-transactions');

const {
	CacheRedis,
	Logger,
	Signals,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const dataService = require('../business');

const { getLastBlock } = require('../blocks');
const { getAllGenerators } = require('../generators');
const { getLisk32AddressFromPublicKey } = require('../../utils/accountUtils');
const { MODULE, COMMAND } = require('../../constants');
const { parseToJSONCompatObj } = require('../../utils/parser');
const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;
const validatorsIndexSchema = require('../../database/schema/validators');

const getValidatorsIndex = () => getTableInstance(
	validatorsIndexSchema.tableName,
	validatorsIndexSchema,
	MYSQL_ENDPOINT,
);

const delegatesCache = CacheRedis('delegates', config.endpoints.cache);

const logger = Logger();

const DELEGATE_STATUS = {
	ACTIVE: 'active',
	STANDBY: 'standby',
	BANNED: 'banned',
	PUNISHED: 'punished',
	INELIGIBLE: 'ineligible',
};

let delegateList = [];

const delegateComparator = (a, b) => {
	const diff = BigInt(b.voteWeight) - BigInt(a.voteWeight);
	if (diff !== BigInt('0')) return Number(diff);
	return a.address.localeCompare(b.address, 'en');
};

// TODO: Remove code after SDK returns rank
const computeDelegateRank = async () => {
	delegateList.sort(delegateComparator);
	delegateList.map((delegate, index) => {
		delegate.rank = index + 1;
		return delegate;
	});
};

const computeDelegateStatus = async () => {
	const MIN_ELIGIBLE_VOTE_WEIGHT = Transactions.convertLSKToBeddows('1000');

	const lastestBlock = getLastBlock();
	const generatorsList = await getAllGenerators();
	const activeGeneratorsList = generatorsList.map(generator => generator.address);

	const verifyIfPunished = (delegate) => {
		const isPunished = delegate.pomHeights
			.some(pomHeight => pomHeight.start <= lastestBlock.height
				&& lastestBlock.height <= pomHeight.end);
		return isPunished;
	};

	delegateList.map((delegate) => {
		logger.debug('Determine delegate status');

		// Default delegate status
		delegate.status = DELEGATE_STATUS.INELIGIBLE;

		// Update delegate status, if applicable
		if (delegate.isBanned) {
			delegate.status = DELEGATE_STATUS.BANNED;
		} else if (verifyIfPunished(delegate)) {
			delegate.status = DELEGATE_STATUS.PUNISHED;
		} else if (activeGeneratorsList.includes(delegate.address)) {
			delegate.status = DELEGATE_STATUS.ACTIVE;
		} else if (BigInt(delegate.voteWeight) >= BigInt(MIN_ELIGIBLE_VOTE_WEIGHT)) {
			delegate.status = DELEGATE_STATUS.STANDBY;
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
				await delegatesCache.set(delegate.address, delegate.name);
				await delegatesCache.set(delegate.name, delegate.address);
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

const reload = async () => {
	if (!await dataService.isDposModuleRegistered()) {
		return;
	}

	await loadAllDelegates();
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
		(!params.name || delegate.name === params.name)
		&& (!params.address || delegate.address === params.address)
	));
	return relevantDelegates.length;
};

const getDelegates = async params => {
	const validatorsTable = await getValidatorsIndex();

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

	delegates.data = await BluebirdPromise.map(
		allDelegates,
		async delegate => {
			const [validatorInfo = {}] = await validatorsTable.find(
				{ address: delegate.address },
				['producedBlocks', 'rewards'],
			);
			return {
				...delegate,
				forgedBlocks: validatorInfo.producedBlocks || 0,
				rewards: validatorInfo.rewards || BigInt('0'),
			};
		}, { concurrency: allDelegates.length },
	);

	if (params.address) {
		delegates.data = filterBy(delegates.data, 'address');
	}
	if (params.name) {
		delegates.data = filterBy(delegates.data, 'name');
	}
	if (params.status) {
		delegates.data = filterBy(delegates.data, 'status');
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
	const EVENT_NEW_BLOCK = 'newBlock';
	const EVENT_DELETE_BLOCK = 'deleteBlock';

	const updateDelegateCacheListener = async (eventType, data) => {
		const updatedDelegateAddresses = [];
		const [block] = data.data;
		if (block && block.transactions && Array.isArray(block.transactions)) {
			block.transactions.forEach(tx => {
				if (tx.module === MODULE.DPOS) {
					if (tx.command === COMMAND.REGISTER_DELEGATE) {
						updatedDelegateAddresses
							.push(getLisk32AddressFromPublicKey(tx.senderPublicKey));
					} else if (tx.command === COMMAND.VOTE_DELEGATE) {
						tx.params.votes
							.forEach(vote => updatedDelegateAddresses.push(vote.delegateAddress));
					}
				}
			});
			// TODO: Validate the logic if there is need to update delegate cache on vote transaction
			if (updatedDelegateAddresses.length) {
				const updatedDelegateAccounts = await dataService
					.getDelegates({ addresses: updatedDelegateAddresses });

				updatedDelegateAccounts.forEach(delegate => {
					const delegateIndex = delegateList.findIndex(acc => acc.address === delegate.address);

					if (eventType === EVENT_DELETE_BLOCK && delegateIndex !== -1) {
						// Remove delegate from list when deleteBlock event contains delegate registration tx
						delegateList.splice(delegateIndex, 1);
					} else if (delegateIndex === -1) {
						// Append to delegate list on newBlock event, if missing
						delegateList.push(delegate);
					} else {
						// Re-assign the current delegate status before updating the delegateList
						// Delegate status can change only at the beginning of a new round
						const { status } = delegateList[delegateIndex];
						delegateList[delegateIndex] = { ...delegate, status };
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
					delegateList[delegateIndex].producedBlocks = eventType === EVENT_NEW_BLOCK
						? delegateList[delegateIndex].producedBlocks + 1
						: delegateList[delegateIndex].producedBlocks - 1;

					delegateList[delegateIndex].rewards = eventType === EVENT_NEW_BLOCK
						? (BigInt(delegateList[delegateIndex].rewards) + BigInt(block.reward)).toString()
						: (BigInt(delegateList[delegateIndex].rewards) - BigInt(block.reward)).toString();
				}
			}
		}
	};

	const updateDelegateCacheOnNewBlockListener = (block) => {
		updateDelegateCacheListener(EVENT_NEW_BLOCK, block);
	};
	const updateDelegateCacheOnDeleteBlockListener = (block) => {
		updateDelegateCacheListener(EVENT_DELETE_BLOCK, block);
	};
	Signals.get('newBlock').add(updateDelegateCacheOnNewBlockListener);
	Signals.get('deleteBlock').add(updateDelegateCacheOnDeleteBlockListener);
};

// Updates the account details of the delegates
const updateDelegateListOnAccountsUpdate = () => {
	const updateDelegateListOnAccountsUpdateListener = (addresses) => {
		addresses.forEach(async address => {
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
};
