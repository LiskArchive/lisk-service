/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const { Logger } = require('lisk-service-framework');
const _ = require('lodash');

const {
	reloadValidatorCache,
	getAllValidators,
} = require('../dataService');

const business = require('../dataService/business');

const logger = Logger();

const validateValidatorCache = async () => {
	const validatorsByStake = await business.getPosValidatorsByStake({ limit: -1 });
	// Create a deep copy of cached validators
	const cachedValidators = _.cloneDeep(await getAllValidators());

	if (validatorsByStake.length > cachedValidators.length) {
		logger.warn(`Eligible validator count is more than cached validator count. Reloading the cache. \n\tEligible validator count: ${validatorsByStake.length} \n\tCached validators count: ${cachedValidators.length}`);
		await reloadValidatorCache();
		return;
	}

	for (let index = 0; index < validatorsByStake.length; index++) {
		if (validatorsByStake[index].address !== cachedValidators[index].address) {
			logger.warn('Incorrect validator ranking detected. Reloading the validators cache.');
			// eslint-disable-next-line no-await-in-loop
			await reloadValidatorCache();
			return;
		}
	}

	logger.debug('Cached validator ranks verified successfully.');
};

module.exports = {
	validateValidatorCache,
};
