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
const PUBLIC_KEY = /^([A-Fa-f0-9]{2}){32}$/;
const ADDRESS_BASE32 = /^lsk[a-hjkm-z2-9]{38}$/;
const NONCE = /^[0-9]+$/;
const TIMESTAMP = /([0-9]+|[0-9]+:[0-9]+)/;
const NAME = /^[a-z0-9!@$&_.]{1,20}$/;
const TRANSACTION_EXECUTION_STATUS = /^(?:\b(?:pending|succeeded|failed|any)\b|\b(?:pending|succeeded|failed|any|,){3,}\b){1}$/;
const HASH_SHA256 = /^\b([A-Fa-f0-9]){1,64}\b$/;

module.exports = {
	PUBLIC_KEY,
	ADDRESS_BASE32,
	NONCE,
	TIMESTAMP,
	NAME,
	TRANSACTION_EXECUTION_STATUS,
	HASH_SHA256,
};
