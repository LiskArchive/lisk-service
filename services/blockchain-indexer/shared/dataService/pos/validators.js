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
const { getLisk32AddressFromPublicKey, getHexAddress } = require('../../utils/accountUtils');
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

const validatorsCache = CacheRedis('validators', config.endpoints.cache);

const logger = Logger();

const VALIDATOR_STATUS = {
	ACTIVE: 'active',
	STANDBY: 'standby',
	BANNED: 'banned',
	PUNISHED: 'punished',
	INELIGIBLE: 'ineligible',
};

let validatorList = [];

const validatorComparator = (a, b) => {
	const diff = BigInt(b.voteWeight) - BigInt(a.voteWeight);
	if (diff !== BigInt('0')) return Number(diff);
	return a.hexAddress.localeCompare(b.hexAddress, 'en');
};

// TODO: Remove code after SDK returns rank
const computeValidatorRank = async () => {
	validatorList
		.map(validator => ({ ...validator, hexAddress: getHexAddress(validator.address) }))
		.sort(validatorComparator);
	validatorList.map((validator, index) => {
		validator.rank = index + 1;
		return validator;
	});
};

const computeValidatorStatus = async () => {
	const MIN_ELIGIBLE_VOTE_WEIGHT = Transactions.convertLSKToBeddows('1000');

	const lastestBlock = getLastBlock();
	const generatorsList = await getAllGenerators();
	const activeGeneratorsList = generatorsList.map(generator => generator.address);

	const verifyIfPunished = (validator) => {
		const isPunished = validator.pomHeights
			.some(pomHeight => pomHeight.start <= lastestBlock.height
				&& lastestBlock.height <= pomHeight.end);
		return isPunished;
	};

	validatorList.map((validator) => {
		logger.debug('Determine validator status.');

		// Default validator status
		validator.status = VALIDATOR_STATUS.INELIGIBLE;

		// Update validator status, if applicable
		if (validator.isBanned) {
			validator.status = VALIDATOR_STATUS.BANNED;
		} else if (verifyIfPunished(validator)) {
			validator.status = VALIDATOR_STATUS.PUNISHED;
		} else if (activeGeneratorsList.includes(validator.address)) {
			validator.status = VALIDATOR_STATUS.ACTIVE;
		} else if (BigInt(validator.voteWeight) >= BigInt(MIN_ELIGIBLE_VOTE_WEIGHT)) {
			validator.status = VALIDATOR_STATUS.STANDBY;
		}
		return validator;
	});
	return validatorList;
};

const loadAllValidators = async () => {
	try {
		validatorList = await dataService.getAllValidators();
		await BluebirdPromise.map(
			validatorList,
			async validator => {
				await validatorsCache.set(validator.address, validator.name);
				await validatorsCache.set(validator.name, validator.address);
				return validator;
			},
			{ concurrency: validatorList.length },
		);

		if (validatorList.length) {
			logger.info(`Updated validator list with ${validatorList.length} validators.`);
		}
	} catch (err) {
		logger.warn(`Failed to load all validators due to: ${err.message}.`);
	}
};

const reloadValidatorCache = async () => {
	if (!await dataService.isPoSModuleRegistered()) {
		return;
	}

	await loadAllValidators();
	await computeValidatorRank();
	await computeValidatorStatus();
};

const getAllValidators = async () => {
	if (validatorList.length === 0) await reloadValidatorCache();
	return validatorList;
};

const getTotalNumberOfValidators = async (params = {}) => {
	const allValidators = await getAllValidators();
	const relevantValidators = allValidators.filter(validator => (
		(!params.name || validator.name === params.name)
		&& (!params.address || validator.address === params.address)
	));
	return relevantValidators.length;
};

const getValidators = async params => {
	const validatorsTable = await getValidatorsIndex();

	const validators = {
		data: [],
		meta: {},
	};
	const allValidators = await getAllValidators();

	const offset = Number(params.offset) || 0;
	const limit = Number(params.limit) || 10;
	if (!params.sort) params.sort = 'rank:asc';

	const sortComparator = (sortParam) => {
		const [sortProp, sortOrder] = sortParam.split(':');

		const comparator = (a, b) => {
			try {
				if (Number.isNaN(Number(a[sortProp]))) throw new Error('Not a number, try string sorting.');
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

	validators.data = await BluebirdPromise.map(
		allValidators,
		async delegate => {
			const [validatorInfo = {}] = await validatorsTable.find(
				{ address: delegate.address },
				['producedBlocks', 'rewards'],
			);
			// TODO: Update - generatedBlocks, totalCommission & totalSelfStakeReward
			return {
				...delegate,
				forgedBlocks: validatorInfo.producedBlocks || 0,
				rewards: validatorInfo.rewards || BigInt('0'),
			};
		}, { concurrency: allValidators.length },
	);

	if (params.address) {
		validators.data = filterBy(validators.data, 'address');
	}
	if (params.name) {
		validators.data = filterBy(validators.data, 'name');
	}
	if (params.status) {
		validators.data = filterBy(validators.data, 'status');
	}

	if (validators.data.every(validator => !validator.rank)) await computeValidatorRank();

	validators.data = validators.data
		.sort(sortComparator(params.sort))
		.slice(offset, offset + limit);

	validators.meta.count = validators.data.length;
	validators.meta.offset = params.offset;
	validators.meta.total = await getTotalNumberOfValidators(params);

	return parseToJSONCompatObj(validators);
};

// Keep the validator cache up-to-date
const updateValidatorListEveryBlock = () => {
	const EVENT_NEW_BLOCK = 'newBlock';
	const EVENT_DELETE_BLOCK = 'deleteBlock';

	const updateValidatorCacheListener = async (eventType, data) => {
		const updatedValidatorAddresses = [];
		const [block] = data.data;
		if (block && block.transactions && Array.isArray(block.transactions)) {
			block.transactions.forEach(tx => {
				if (tx.module === MODULE.POS) {
					if (tx.command === COMMAND.REGISTER_DELEGATE) {
						updatedValidatorAddresses
							.push(getLisk32AddressFromPublicKey(tx.senderPublicKey));
					} else if (tx.command === COMMAND.VOTE_DELEGATE) {
						// TODO: Verify
						tx.params.votes
							.forEach(vote => updatedValidatorAddresses.push(vote.address));
					}
				}
			});

			// TODO: Validate the logic if there is need to update validator cache on (un-)stake tx
			if (updatedValidatorAddresses.length) {
				const updatedValidatorAccounts = await dataService
					.getValidators({ addresses: updatedValidatorAddresses });

				updatedValidatorAccounts.forEach(validator => {
					const validatorIndex = validatorList.findIndex(acc => acc.address === validator.address);

					if (eventType === EVENT_DELETE_BLOCK && validatorIndex !== -1) {
						// Remove validator from list when deleteBlock event contains validator registration tx
						validatorList.splice(validatorIndex, 1);
					} else if (validatorIndex === -1) {
						// Append to validator list on newBlock event, if missing
						validatorList.push(validator);
					} else {
						// Re-assign the current validator status before updating the validatorList
						// Validator status can change only at the beginning of a new round
						const { status } = validatorList[validatorIndex];
						validatorList[validatorIndex] = { ...validator, status };
					}
				});

				// Rank is impacted only when a validator gets (un-)voted
				await computeValidatorRank();
			}

			// Update validator cache with producedBlocks and rewards
			const validatorIndex = validatorList.findIndex(acc => acc.address === block.generatorAddress);
			if (validatorList[validatorIndex]
				&& Object.getOwnPropertyNames(validatorList[validatorIndex]).length) {
				// TODO: Update
				if (validatorList[validatorIndex].producedBlocks && validatorList[validatorIndex].rewards) {
					validatorList[validatorIndex].producedBlocks = eventType === EVENT_NEW_BLOCK
						? validatorList[validatorIndex].producedBlocks + 1
						: validatorList[validatorIndex].producedBlocks - 1;

					validatorList[validatorIndex].rewards = eventType === EVENT_NEW_BLOCK
						? (BigInt(validatorList[validatorIndex].rewards) + BigInt(block.reward)).toString()
						: (BigInt(validatorList[validatorIndex].rewards) - BigInt(block.reward)).toString();
				}
			}
		}
	};

	const updateValidatorCacheOnNewBlockListener = (block) => {
		updateValidatorCacheListener(EVENT_NEW_BLOCK, block);
	};
	const updateValidatorCacheOnDeleteBlockListener = (block) => {
		updateValidatorCacheListener(EVENT_DELETE_BLOCK, block);
	};
	Signals.get('newBlock').add(updateValidatorCacheOnNewBlockListener);
	Signals.get('deleteBlock').add(updateValidatorCacheOnDeleteBlockListener);
};

// Updates the account details of the validators
const updateValidatorListOnAccountsUpdate = () => {
	const updateValidatorListOnAccountsUpdateListener = (addresses) => {
		addresses.forEach(async address => {
			const validatorIndex = validatorList.findIndex(acc => acc.address === address);
			const validator = validatorList[validatorIndex] || {};
			if (Object.getOwnPropertyNames(validator).length) {
				const {
					data: [updatedValidator],
				} = await dataService.getValidators({ address: validator.address, limit: 1 });

				// Update the account details of the affected validator
				Object.assign(validator, parseToJSONCompatObj(updatedValidator));
			}
		});
	};

	Signals.get('updateAccountState').add(updateValidatorListOnAccountsUpdateListener);
};

updateValidatorListEveryBlock();
updateValidatorListOnAccountsUpdate();

module.exports = {
	reloadValidatorCache,
	getTotalNumberOfValidators,
	getValidators,
};
