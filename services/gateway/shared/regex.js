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
const ADDRESS_LISK32 = /^lsk[a-hjkm-z2-9]{38}$/;
const ADDRESS_LISK32_CSV = /^(lsk[a-hjkm-z2-9]{38}){1}(,lsk[a-hjkm-z2-9]{38})*$/;
const NONCE = /^[0-9]+$/;
const TIMESTAMP_RANGE = /^(?:(?:\d+)|(?::(?:\d+))|(?:(?:\d+):(?:\d+)?))$/;
const HEIGHT_RANGE = /^(?:(?:\d+)|(?::(?:\d+))|(?:(?:\d+):(?:\d+)?))$/;
const NAME = /^[\w!@$&.]{3,20}$/;
const NAME_CSV = /^[\w!@$&.,]{3,}$/;
const TRANSACTION_EXECUTION_STATUS = /^\b(?:pending|success|fail|,)+\b$/;
const POS_VALIDATOR_STATUS = /^\b(?:active|standby|banned|punished|ineligible|,)+\b$/;
const NEWSFEED_SOURCE = /^\b(?:(?:drupal_lisk(?:_general|_announcements)|twitter_lisk),?)+\b$/;
const HASH_SHA256 = /^\b([A-Fa-f0-9]){1,64}\b$/;
const CCM_STATUS = /^\b(?:ok|module_not_supported|module_not_supported|channel_unavailable|recovered|,)+\b$/;
const INTERVAL = /^\b((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))(:((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31)))?\b$/g;
const CHAINID_RANGE = /^\b(?:[0-9]{1,10}(?::[0-9]{1,10})?)\b$/;
const NETWORK_CSV = /^\b(?:mainnet|testnet|betanet|alphanet|devnet|,)+\b$/;
const APPLICATION_STATUS = /^\b(?:registered|active|terminated|,)+\b$/;
const MODULE_COMMAND = /^[a-zA-Z][\w]{0,31}:[a-zA-Z][\w]{0,31}$/;
const CHAIN_ID = /^\b[a-fA-F0-9]{8}\b$/;
const CHAIN_ID_CSV = /^\b[a-fA-F0-9,]{8,}\b$/;
const TOKEN_ID = /^\b[a-fA-F0-9]{16}\b$/;
const TOKEN_ID_CSV = /^\b[a-fA-F0-9,]{16,}\b$/;
const BLS_KEY = /^\b[a-fA-F0-9]{96}\b$/;
const PROOF_OF_POSSESSION = /^\b[a-fA-F0-9]{192}\b$/;
const MODULE = /^\b(?:[\w!@$&.]{1,32}|,)+\b$/;
const TOPIC = /^\b(?:[0-9a-fA-F]+|lsk[a-hjkm-z2-9]{38})\b$/;

module.exports = {
	PUBLIC_KEY,
	ADDRESS_LISK32,
	ADDRESS_LISK32_CSV,
	NONCE,
	NAME,
	NAME_CSV,
	TRANSACTION_EXECUTION_STATUS,
	POS_VALIDATOR_STATUS,
	NEWSFEED_SOURCE,
	HASH_SHA256,
	TIMESTAMP_RANGE,
	HEIGHT_RANGE,
	CCM_STATUS,
	INTERVAL,
	CHAINID_RANGE,
	NETWORK_CSV,
	APPLICATION_STATUS,
	MODULE_COMMAND,
	CHAIN_ID,
	CHAIN_ID_CSV,
	TOKEN_ID,
	TOKEN_ID_CSV,
	BLS_KEY,
	PROOF_OF_POSSESSION,
	MODULE,
	TOPIC,
};
