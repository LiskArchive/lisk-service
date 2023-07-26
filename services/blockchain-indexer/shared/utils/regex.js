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
const ADDRESS_LISK32 = /^lsk[a-hjkm-z2-9]{38}$/;
const TOKEN_ID = /[0-9A-Fa-f]{16}/;
const MAINCHAIN_ID = /^\d{2}0{6}$/;
const NAME = /^[\w!@$&.]{1,20}$/;
const PUBLIC_KEY = /^([A-Fa-f0-9]{2}){32}$/;
const PRIVATE_IP_REGEX = /^(10(\.\d{1,3}){3})|((172\.(1[6-9]|2\d|3[0-1])|192\.168)(\.\d{1,3}){2})$/;

module.exports = {
	ADDRESS_LISK32,
	MAINCHAIN_ID,
	NAME,
	PUBLIC_KEY,
	TOKEN_ID,
	PRIVATE_IP_REGEX,
};
