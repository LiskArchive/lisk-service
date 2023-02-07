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

const { getPosConstants } = require('../business');
const business = require('../business');
const config = require('../../../config');
const accountsIndexSchema = require('../../database/schema/accounts');
const validatorsIndexSchema = require('../../database/schema/validators');

const {
	getLisk32AddressFromPublicKey,
	getHexAddress,
	updateAccountPublicKey,
	getIndexedAccountInfo,
} = require('../../utils/accountUtils');
const { getLastBlock } = require('../blocks');
const { MODULE, COMMAND } = require('../../constants');
const { sortComparator } = require('../../utils/arrayUtils');
const { parseToJSONCompatObj } = require('../../utils/parser');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getAccountsTable = () => getTableInstance(
	accountsIndexSchema.tableName,
	accountsIndexSchema,
	MYSQL_ENDPOINT,
);

const getValidatorsTable = () => getTableInstance(
	validatorsIndexSchema.tableName,
	validatorsIndexSchema,
	MYSQL_ENDPOINT,
);

const validatorCache = CacheRedis('validator', config.endpoints.cache);

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
	const diff = BigInt(b.validatorWeight) - BigInt(a.validatorWeight);
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
	const {
		data: { numberActiveValidators, numberStandbyValidators },
	} = await getPosConstants();

	const MIN_ELIGIBLE_VOTE_WEIGHT = Transactions.convertLSKToBeddows('1000');

	const lastestBlock = getLastBlock();
	const generatorsList = await business.getGenerators();

	const generatorMap = new Map(generatorsList.map(generator => [generator.address, generator]));

	const generatorInfo = (validatorList
		.filter(validator => generatorMap.get(validator.address)))
		.map(entry => ({ ...entry, hexAddress: getHexAddress(entry.address) }))
		.sort(validatorComparator);

	const activeGeneratorsList = (generatorInfo.slice(0, numberActiveValidators))
		.map(acc => acc.address);

	const standByGeneratorsList = (generatorInfo
		.slice(generatorInfo.length - numberStandbyValidators)).map(acc => acc.address);

	const verifyIfPunished = (validator) => {
		const isPunished = validator.punishmentPeriods.some(
			punishmentPeriod => punishmentPeriod.start <= lastestBlock.height
				&& lastestBlock.height <= punishmentPeriod.end,
		);
		return isPunished;
	};

	logger.debug('Determine validator status.');
	validatorList.forEach((validator) => {
		// Update validator status, if applicable
		if (validator.isBanned) {
			validator.status = VALIDATOR_STATUS.BANNED;
		} else if (verifyIfPunished(validator)) {
			validator.status = VALIDATOR_STATUS.PUNISHED;
		} else if (activeGeneratorsList.includes(validator.address)) {
			validator.status = VALIDATOR_STATUS.ACTIVE;
		} else if (standByGeneratorsList.includes(validator.address)) {
			validator.status = VALIDATOR_STATUS.STANDBY;
		} else if (BigInt(validator.validatorWeight) >= BigInt(MIN_ELIGIBLE_VOTE_WEIGHT)) {
			validator.status = VALIDATOR_STATUS.STANDBY;
		} else {
			// Default validator status
			validator.status = VALIDATOR_STATUS.INELIGIBLE;
		}
		return validator;
	});

	return validatorList;
};

const loadAllPosValidators = async () => {
	try {
		// TODO: Enable with Lisk SDK v6.0.0-alpha.8
		// Ref: https://github.com/LiskHQ/lisk-sdk/issues/7870
		// // Fetch all the validators sorted by stake
		// validatorList = await business.getPosValidatorsByStake({ limit: -1 });
		validatorList = await business.getAllPosValidators();

		// Cache and index all the necessary information
		const accountsTable = await getAccountsTable();
		await BluebirdPromise.map(
			validatorList,
			async validator => {
				const { address, name } = validator;
				await validatorCache.set(address, name);
				await validatorCache.set(name, address);
				await accountsTable.upsert({ address, name, isValidator: true });
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
	if (!await business.isPosModuleRegistered()) return;

	await loadAllPosValidators();
	// TODO: Remove rank computation after Lisk SDK v6.0.0-alpha.8
	await computeValidatorRank();
	await computeValidatorStatus();
};

const getAllValidators = async () => {
	if (validatorList.length === 0) await reloadValidatorCache();
	return validatorList;
};

const getPosValidators = async params => {
	const validators = {
		data: [],
		meta: {},
	};

	const addressSet = new Set();
	const nameSet = new Set();
	const statusSet = new Set();

	if (params.publicKey) {
		const address = getLisk32AddressFromPublicKey(params.publicKey);

		// Return empty response if user specified address and publicKey pair does not match
		if (params.address && params.address.split(',').includes(address)) {
			return validators;
		}
		params.address = address;

		// Index publicKey asynchronously
		updateAccountPublicKey(params.publicKey);
	}

	if (params.address) params.address.split(',').forEach(address => addressSet.add(address));
	if (params.name) params.name.split(',').forEach(name => nameSet.add(name));
	if (params.status) params.status.split(',').forEach(status => statusSet.add(status));

	const validatorsTable = await getValidatorsTable();
	const allValidators = await getAllValidators();

	// Filter validators based on user passed params
	const filteredValidators = allValidators.filter(validator => {
		if (addressSet.size && !addressSet.has(validator.address)) return false;
		if (nameSet.size && !nameSet.has(validator.name)) return false;
		if (statusSet.size && !statusSet.has(validator.status)) return false;
		if (params.search && !validator.name.toLowerCase().includes(params.search.toLowerCase())) {
			return false;
		}
		return true;
	});

	validators.data = await BluebirdPromise.map(
		filteredValidators,
		async validator => {
			const [validatorInfo = {}] = await validatorsTable.find(
				{ address: validator.address },
				['generatedBlocks', 'totalCommission', 'totalSelfStakeRewards'],
			);
			const {
				generatedBlocks = 0,
				totalCommission = BigInt('0'),
				totalSelfStakeRewards = BigInt('0'),
			} = validatorInfo;

			const { publicKey = null } = await getIndexedAccountInfo({ address: validator.address }, ['publicKey']);

			return {
				...validator,
				publicKey,
				generatedBlocks,
				totalCommission,
				totalSelfStakeRewards,
				earnedRewards: totalCommission + totalSelfStakeRewards,
			};
		},
		{ concurrency: validators.data.length },
	);

	// TODO: Remove after Lisk SDK v6.0.0-alpha.8
	if (validators.data.every(validator => !validator.rank)) await computeValidatorRank();

	// Assign the total count
	validators.meta.total = validators.data.length;

	// Sort appropriately and apply pagination
	validators.data = validators.data
		.sort(sortComparator(params.sort))
		.slice(params.offset, params.offset + params.limit);

	validators.meta.count = validators.data.length;
	validators.meta.offset = params.offset;

	return parseToJSONCompatObj(validators);
};

// TODO: Test
// Keep the validator cache up-to-date
const updateValidatorListEveryBlock = () => {
	const EVENT_NEW_BLOCK = 'newBlock';
	const EVENT_DELETE_BLOCK = 'deleteBlock';

	const updateValidatorCacheListener = async (eventType, data) => {
		const updatedValidatorAddresses = [];
		const [block] = data.data;
		try {
			if (block && block.transactions && Array.isArray(block.transactions)) {
				block.transactions.forEach(tx => {
					if (tx.module === MODULE.POS) {
						if (tx.command === COMMAND.REGISTER_VALIDATOR) {
							updatedValidatorAddresses
								.push(getLisk32AddressFromPublicKey(tx.senderPublicKey));
						} else if (tx.command === COMMAND.STAKE) {
							// TODO: Verify
							tx.params.stakes
								.forEach(stake => updatedValidatorAddresses.push(stake.validatorAddress));
						}
					}
				});

				// TODO: Validate the logic if there is need to update validator cache on (un-)stake tx
				if (updatedValidatorAddresses.length) {
					const updatedValidatorAccounts = await business
						.getPosValidators({ addresses: updatedValidatorAddresses });

					updatedValidatorAccounts.forEach(validator => {
						const validatorIndex = validatorList
							.findIndex(acc => acc.address === validator.address);

						if (eventType === EVENT_DELETE_BLOCK && validatorIndex !== -1) {
							// Remove validator from list when
							// deleteBlock event contains validator registration tx
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

				// Update validator cache with generatedBlocks and rewards
				const validatorIndex = validatorList
					.findIndex(acc => acc.address === block.generatorAddress);
				if (validatorList[validatorIndex]
					&& Object.getOwnPropertyNames(validatorList[validatorIndex]).length) {
					// TODO: Update
					if (
						validatorList[validatorIndex].generatedBlocks && validatorList[validatorIndex].rewards
					) {
						validatorList[validatorIndex].generatedBlocks = eventType === EVENT_NEW_BLOCK
							? validatorList[validatorIndex].generatedBlocks + 1
							: validatorList[validatorIndex].generatedBlocks - 1;

						validatorList[validatorIndex].rewards = eventType === EVENT_NEW_BLOCK
							? (BigInt(validatorList[validatorIndex].rewards) + BigInt(block.reward)).toString()
							: (BigInt(validatorList[validatorIndex].rewards) - BigInt(block.reward)).toString();
					}
				}
			}
		} catch (err) {
			logger.warn(`Unable to update the validator cache due to:\n${err.stack}`);
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
				} = await business.getValidators({ address: validator.address, limit: 1 });

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
	getPosValidators,
	getAllValidators,
};
