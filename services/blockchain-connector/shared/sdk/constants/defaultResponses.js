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

const DEFAULT_RES_GET_STAKER = {
	stakes: [],
	pendingUnlocks: [],
};

const DEFAULT_RES_GET_CHAIN_ACCOUNT = {
	lastCertificate: {},
	name: null,
	status: null,
};

module.exports = {
	POS: {
		GET_STAKER: DEFAULT_RES_GET_STAKER,
	},
	INTEROPERABILITY: {
		GET_CHAIN_ACCOUNT: DEFAULT_RES_GET_CHAIN_ACCOUNT,
	},
};
