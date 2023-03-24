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
const BLS_KEY = /^\b[a-fA-F0-9]{96}\b$/;
const CHAIN_ID = /^\b[a-fA-F0-9]{8}\b$/;
const PROOF_OF_POSSESSION = /^\b[a-fA-F0-9]{192}\b$/;
const CHAIN_ACCOUNT_KEY_NOT_FOUND_ERROR = /^Key [a-f0-9]{20} does not exist\.$/;
const STARTER_KEY_NOT_FOUND_ERROR = /^Key [a-f0-9]{52} does not exist\.$/;

module.exports = {
	BLS_KEY,
	CHAIN_ID,
	PROOF_OF_POSSESSION,
	CHAIN_ACCOUNT_KEY_NOT_FOUND_ERROR,
	STARTER_KEY_NOT_FOUND_ERROR,
};
