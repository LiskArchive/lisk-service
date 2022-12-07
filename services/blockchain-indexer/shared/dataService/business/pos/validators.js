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

const { CacheRedis } = require('lisk-service-framework');

const config = require('../../../../config');

const { requestConnector } = require('../../../utils/request');
const { MODULE } = require('../../../constants');

const LAST_BLOCK_CACHE = 'lastBlock';
const lastBlockCache = CacheRedis(LAST_BLOCK_CACHE, config.endpoints.cache);

const LAST_BLOCK_KEY = 'lastBlock';

const isPosModuleRegistered = async () => {
	const response = await requestConnector('getSystemMetadata');
	const isRegistered = response.modules.some(module => module.name === MODULE.POS);
	return isRegistered;
};

const verifyIfPunished = async validator => {
	const latestBlockString = await lastBlockCache.get(LAST_BLOCK_KEY);
	const latestBlock = latestBlockString ? JSON.parse(latestBlockString) : {};

	// TODO: Get this information from SDK directly once available
	const isPunished = validator.pomHeights
		.some(pomHeight => pomHeight.start <= latestBlock.height
			&& latestBlock.height <= pomHeight.end);
	return isPunished;
};

const getAllPosValidators = async () => {
	const { validators: rawValidators } = await requestConnector('getAllPosValidators');
	const validators = await BluebirdPromise.map(
		rawValidators,
		async validator => {
			// TODO: Get validatorWeight from SDK directly when available
			if (validator.isBanned || await verifyIfPunished(validator)) {
				validator.voteWeight = BigInt('0');
			} else {
				const cap = BigInt(validator.selfVotes) * BigInt(10);
				validator.totalVotesReceived = BigInt(validator.totalVotesReceived);
				validator.voteWeight = BigInt(validator.totalVotesReceived) > cap
					? cap
					: validator.totalVotesReceived;
			}
			return validator;
		},
		{ concurrency: rawValidators.length },
	);

	return validators;
};

const getPosValidators = async (params) => {
	const { address, addresses, ...remParams } = params;
	params = remParams;
	params.addresses = address ? [address] : addresses;

	const validators = await BluebirdPromise.map(
		params.addresses,
		async validatorAddress => {
			const validator = await requestConnector('getPoSValidator', { address: validatorAddress });
			// TODO: Verify
			// TODO: Check if it is possible to move this logic to the connector
			if (validator.isBanned || await verifyIfPunished(validator)) {
				validator.voteWeight = BigInt('0');
			} else {
				const cap = BigInt(validator.selfVotes) * BigInt(10);
				validator.totalVotesReceived = BigInt(validator.totalVotesReceived);
				validator.voteWeight = BigInt(validator.totalVotesReceived) > cap
					? cap
					: validator.totalVotesReceived;
			}
			return validator;
		},
		{ concurrency: params.addresses.length },
	);
	return validators;
};

module.exports = {
	getPosValidators,
	getAllPosValidators,
	isPosModuleRegistered,
};
