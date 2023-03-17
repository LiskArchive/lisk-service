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
const IP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const HASH_SHA256 = /^\b([A-Fa-f0-9]){64}\b$/;
const HASH_SHA512 = /^\b([A-Fa-f0-9]){128}\b$/;
const SEMVER = /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/;
const PUBLIC_KEY = /^([A-Fa-f0-9]{2}){32}$/;
const EVENT_NAME = /^[\w!@$&. ]+$/;
const NAME = /^[\w!@$&.]{1,20}$/;
const NEWSFEED_SOURCE = /^\b(?:(?:drupal_lisk(?:_general|_announcements)|twitter_lisk),?)+\b$/;
const NONCE = /^[0-9]+$/;
const INTERVAL = /^\b((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))(:((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31)))?\b$/;
const FILE_NAME = /^\btransactions_(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.csv\b$/;
const FILE_URL = /^\/api\/v3\/exports\/transactions_(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.csv$/;
const NETWORK = /^\b(?:mainnet|testnet|betanet|alphanet|devnet){1}\b$/;
const MODULE = /^[a-zA-Z][\w]{0,31}$/;
const MODULE_COMMAND = /^[a-zA-Z][\w]{0,31}:[a-zA-Z][\w]{0,31}$/;
const CHAIN_ID = /^\b[a-fA-F0-9]{8}\b$/;
const TOKEN_ID = /^\b[a-fA-F0-9]{16}\b$/;
const TOKEN_ID_PATTERN = /^[a-fA-F0-9]{8}[*]{8}$/;
const DURATION = /^\d{4}-\d{2}(?:-\d{2})?$/;
const DIGITS = /^\d+$/;
const POSITIVE_DIGITS = /^[1-9]+\d*$/;
const FLOATING_POINT = /^[0-9]+(\.[0-9]+)?$/;
const VOTE_WEIGHT = /^\b[1-9]\d*000000000\b$/;
const HEX = /^\b[0-9a-fA-F]+\b$/;
const TOPIC = /^\b(?:[0-9a-fA-F]+|lsk[a-hjkm-z2-9]{38})\b$/;
const EMPTY_STRING = /^$/;
const POS_VALIDATOR_STATUS = /^\b(?:active|standby|banned|punished|ineligible|,)+\b$/;
const SWAGGER_RESPONSE_KEY = /^([0-9]{3})$|^(default)$/;

module.exports = {
	ADDRESS_LISK32,
	IP,
	HASH_SHA256,
	HASH_SHA512,
	MODULE,
	MODULE_COMMAND,
	PUBLIC_KEY,
	SEMVER,
	EVENT_NAME,
	NAME,
	NEWSFEED_SOURCE,
	NONCE,
	INTERVAL,
	FILE_NAME,
	FILE_URL,
	NETWORK,
	TOKEN_ID,
	TOKEN_ID_PATTERN,
	CHAIN_ID,
	DURATION,
	DIGITS,
	FLOATING_POINT,
	VOTE_WEIGHT,
	HEX,
	TOPIC,
	EMPTY_STRING,
	POSITIVE_DIGITS,
	POS_VALIDATOR_STATUS,
	SWAGGER_RESPONSE_KEY,
};
