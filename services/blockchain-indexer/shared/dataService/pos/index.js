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
const {
	reloadDelegateCache,
	getTotalNumberOfDelegates,
	getDelegates,
} = require('./delegates');

const { getStakes } = require('./stakes');
const { getStakers } = require('./stakers');
const { getPosUnlocks } = require('./unlocks');
const { getPosConstants } = require('./constants');
const { getPosLockedRewards } = require('./lockedRewards');

module.exports = {
	reloadDelegateCache,
	getTotalNumberOfDelegates,
	getDelegates,

	getStakes,

	getStakers,

	getPosUnlocks,

	getPosConstants,

	getPosLockedRewards,
};
