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

const {
	reloadValidatorCache,
	getAllValidators,
} = require('../dataService');

const business = require('../dataService/business');

const logger = Logger();

const validateValidatorCache = async () => {
	const nodeValidators = await business.getPosValidatorsByStake({ limit: -1 });
	// Create a deep copy of cached validators
	const cachedValidators = (await getAllValidators()).slice();

	if (nodeValidators.length > cachedValidators.length) {
		logger.warn(`Node has more validators than cache. node validators count:${nodeValidators.length} cached validators count:${cachedValidators.length}.`);
		await reloadValidatorCache();
		return;
	}

	for (let index = 0; index < nodeValidators.length; index++) {
		if (nodeValidators[index].address !== cachedValidators[index].address) {
			logger.warn('Mismatch found in validator rank order of node and cache. Reloading validators cache.');
			// eslint-disable-next-line no-await-in-loop
			await reloadValidatorCache();
			return;
		}
	}

	logger.debug('Validator cache order matched with node validator ranking');
};

module.exports = {
	validateValidatorCache,
};
