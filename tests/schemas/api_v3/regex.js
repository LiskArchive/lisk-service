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
const ADDRESS_BASE32 = /^lsk[a-hjkm-z2-9]{38}$/;
const IP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const HASH_SHA256 = /^\b([A-Fa-f0-9]){1,64}\b$/;
const MODULE_COMMAND_ID = /^\b(?:[0-9]+:[0-9]+)\b$/;
const MODULE_COMMAND_NAME = /^\b(?:[0-9a-zA-Z]+:[0-9a-zA-Z]+)\b$/;
const SEMVER = /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/;
const PUBLIC_KEY = /^([A-Fa-f0-9]{2}){32}$/;
const NAME = /^[a-z0-9!@$&_.]{1,20}$/;
const NEWSFEED_SOURCE = /^\b(?:(?:drupal_lisk(?:_general|_announcements)|twitter_lisk),?)+\b$/;
const NONCE = /^[0-9]+$/;
const INTERVAL = /^\b((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))(:((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31)))?\b$/;
const FILE_NAME = /^\btransactions_(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.csv\b$/;
const FILE_URL = /^\/api\/v2\/exports\/transactions_(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.csv$/;
const NETWORK = /^\b(?:mainnet|testnet|betanet){1}\b$/;
const MODULE_COMMAND = /[a-zA-Z]{1,32}:[a-zA-Z]{1,32}/;
const TOKEN_ID = /^[0-9a-fA-F]{16}$/;

module.exports = {
	ADDRESS_BASE32,
	IP,
	HASH_SHA256,
	MODULE_COMMAND_ID,
	MODULE_COMMAND_NAME,
	PUBLIC_KEY,
	SEMVER,
	NAME,
	NEWSFEED_SOURCE,
	NONCE,
	INTERVAL,
	FILE_NAME,
	FILE_URL,
	NETWORK,
	MODULE_COMMAND,
	TOKEN_ID,
};
