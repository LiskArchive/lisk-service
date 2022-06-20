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
const LIMIT = /^\b((?:[1-9][0-9]?)|100)\b$/;
const OFFSET = /^\b([0-9][0-9]*)\b$/;
const TIMESTAMP = /([0-9]+|[0-9]+:[0-9]+)/;

module.exports = {
	PUBLIC_KEY,
	ADDRESS_BASE32,
	NONCE,
	LIMIT,
	OFFSET,
	TIMESTAMP,
};
