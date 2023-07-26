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
const MODULE = Object.freeze({
	TOKEN: 'token',
	LEGACY: 'legacy',
	POS: 'pos',
});

const COMMAND = Object.freeze({
	TRANSFER: 'transfer',
	TRANSFER_CROSS_CHAIN: 'transferCrossChain',
	RECLAIM_LSK: 'reclaimLSK',
});

const EVENT = Object.freeze({
	CCM_TRANSFER: 'ccmTransfer',
	REWARDS_ASSIGNED: 'rewardsAssigned',
});

const MODULE_SUB_STORE = Object.freeze({
	TOKEN: {
		USER: 'userSubstore',
	},
	LEGACY: {
		ACCOUNTS: 'accounts',
	},
});

module.exports = {
	MODULE,
	COMMAND,
	EVENT,
	MODULE_SUB_STORE,
};
