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
	INTEROPERABILITY: 'interoperability',
});

const COMMAND = Object.freeze({
	TRANSFER: 'transfer',
	TRANSFER_CROSS_CHAIN: 'transferCrossChain',
	RECLAIM_LSK: 'reclaimLSK',
	SUBMIT_MAINCHAIN_CROSS_CHAIN_UPDATE: 'submitMainchainCrossChainUpdate',
	SUBMIT_SIDECHAIN_CROSS_CHAIN_UPDATE: 'submitSidechainCrossChainUpdate',
});

const EVENT = Object.freeze({
	CCM_TRANSFER: 'ccmTransfer',
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
