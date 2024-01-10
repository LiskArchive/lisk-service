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
const { Logger, Signals } = require('lisk-service-framework');

const { invokeEndpoint } = require('./client');
const { MODULE_NAME_POS } = require('./constants/names');
const { getBlockByHeight } = require('./blocks');
const regex = require('../utils/regex');
const { getGenesisHeight } = require('./genesisBlock');

const logger = Logger();

let posModuleConstants;
let allPosValidators;

const getPosValidator = async address => {
	const validator = await invokeEndpoint('pos_getValidator', { address });
	return validator;
};

const getAllPosValidators = async isForceReload => {
	if (!allPosValidators || isForceReload) {
		const response = await invokeEndpoint('pos_getAllValidators');
		if (response && Array.isArray(response.validators)) {
			allPosValidators = response;
			logger.info(
				`Reloaded PoS validators list with ${allPosValidators.validators.length} entries.`,
			);
		} else {
			return response;
		}
	}
	return allPosValidators;
};

Signals.get('reloadAllPosValidators').add(() =>
	getAllPosValidators(true).catch(err => {
		logger.warn(
			`Could not force reload the PoS validators list. Will retry again later.\nError: ${err.message}`,
		);
	}),
);

const getPosValidatorsByStake = async limit => {
	const validators = await invokeEndpoint('pos_getValidatorsByStake', { limit });
	return validators;
};

const getPosConstants = async () => {
	if (typeof posModuleConstants === 'undefined') {
		const response = await invokeEndpoint('pos_getConstants');

		if (response.error) throw new Error(response.error);
		posModuleConstants = response;
	}

	return posModuleConstants;
};

const getPosPendingUnlocks = async address => {
	const response = await invokeEndpoint('pos_getPendingUnlocks', { address });
	return response;
};

const getStaker = async address => {
	const staker = await invokeEndpoint('pos_getStaker', { address });

	if (staker.error && regex.KEY_NOT_EXIST.test(staker.error.message)) {
		return {
			stakes: [],
			pendingUnlocks: [],
		};
	}

	return staker;
};

const getPosClaimableRewards = async ({ address }) => {
	const claimableRewards = await invokeEndpoint('pos_getClaimableRewards', { address });
	return claimableRewards;
};

const getPosLockedReward = async ({ address, tokenID }) => {
	const lockedReward = await invokeEndpoint('pos_getLockedReward', { address, tokenID });
	return lockedReward;
};

const getPoSGenesisStakers = async () => {
	const genesisHeight = await getGenesisHeight();
	const block = await getBlockByHeight(genesisHeight, true);
	const { stakers = [] } = block.assets.find(asset => asset.module === MODULE_NAME_POS).data;
	return stakers;
};

const getPoSGenesisValidators = async () => {
	const genesisHeight = await getGenesisHeight();
	const block = await getBlockByHeight(genesisHeight, true);
	const { validators = [] } = block.assets.find(asset => asset.module === MODULE_NAME_POS).data;
	return validators;
};

module.exports = {
	getPosValidator,
	getAllPosValidators,
	getPosValidatorsByStake,
	getPosLockedReward,
	getPosConstants,
	getStaker,
	getPosClaimableRewards,
	getPosPendingUnlocks,
	getPoSGenesisStakers,
	getPoSGenesisValidators,
};
