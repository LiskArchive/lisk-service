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
const LENGTH_CHAIN_ID = 4 * 2; // Each byte is represented with 2 nibbles

const KV_STORE_KEY = {
	COMMIT_HASH_UNTIL_LAST_SYNC: 'commitHashUntilLastSync',
};

module.exports = {
	LENGTH_CHAIN_ID,
	KV_STORE_KEY,
};
