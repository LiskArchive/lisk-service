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

	const validatorsTable = await getValidatorsTable();
	validators.data = await getAllValidators();

	const filterBy = (list, entity) => list.filter(
		(acc) => params[entity].includes(',')
			? (acc[entity] && params[entity].split(',').includes(acc[entity]))
			: (acc[entity] && acc[entity] === params[entity]),
	);

	if (params.publicKey) {
		params.address = getLisk32AddressFromPublicKey(params.publicKey);

		// Index publicKey asynchronously
		updateAccountPublicKey(params.publicKey);
	}

	if (params.address) validators.data = filterBy(validators.data, 'address');
	if (params.name) validators.data = filterBy(validators.data, 'name');
	if (params.status) validators.data = filterBy(validators.data, 'status');
	if (params.search) {
		validators.data = validators.data
			.filter(v => v.name.toLowerCase().includes(params.search.toLowerCase()));
	}

	validators.data = await BluebirdPromise.map(
		validators.data,
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

			return {
				...validator,
				generatedBlocks,
				totalCommission,
				totalSelfStakeRewards,
				earnedRewards: totalCommission + totalSelfStakeRewards,
			};
		},
		{ concurrency: validators.data.length },
	);

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
	const updateValidatorCacheListener = async (data) => {
		const [block] = data.data;
		if (block && block.transactions && Array.isArray(block.transactions)) {
			block.transactions.forEach(async tx => {
				if (tx.module === MODULE.POS) {
					if (tx.command === COMMAND.REGISTER_VALIDATOR || tx.command === COMMAND.STAKE) {
						await reloadValidatorCache();
					}
				}
			});
		}
	};

	Signals.get('newBlock').add(updateValidatorCacheListener);
	Signals.get('deleteBlock').add(updateValidatorCacheListener);
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
