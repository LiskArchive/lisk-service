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
const BLOCK_ID = /^[1-9a-fA-F][A-Fa-f0-9]{0,63}$/;
const PARTIAL_SEARCH = /^[\w!@$&.]{1,64}$/; // Supports address, publicKey & name
const NONCE = /^\d+$/;
const PARTIAL_SEARCH_NAME = /^[\w!@$&.]{1,20}$/;
const TIMESTAMP_RANGE = /^(?:(?:\d+)|(?::(?:\d+))|(?:(?:\d+):(?:\d+)?))$/;
const HEIGHT_RANGE = /^(?:(?:\d+)|(?::(?:\d+))|(?:(?:\d+):(?:\d+)?))$/;
const IP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const LIMIT = /^\b((?:[1-9][0-9]?)|100)\b$/;
const NAME = /^[\w!@$&.]{3,20}$/;
const NAME_CSV = /^[\w!@$&.,]{3,}$/;
const NETWORK_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;
const OFFSET = /^\b([0-9][0-9]*)\b$/;
const TRANSACTION = /^\b[0-9a-fA-F]+\b$/;
const TRANSACTION_EXECUTION_STATUS = /^\b(?:pending|success|fail|,)+\b$/;
const POS_VALIDATOR_STATUS = /^\b(?:active|standby|banned|punished|ineligible|,)+\b$/;
const HASH_SHA256 = /^\b([A-Fa-f0-9]){64}\b$/;
const HASH_SHA512 = /^\b([A-Fa-f0-9]){128}\b$/;
const CCM_STATUS = /^\b(?:ok|module_not_supported|module_not_supported|channel_unavailable|recovered|,)+\b$/;
const INTERVAL = /^\b((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))(:((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31)))?\b$/g;
const NETWORK_CSV = /^\b(?:mainnet|testnet|betanet|alphanet|devnet|,)+\b$/;
const APPLICATION_STATUS = /^\b(?:registered|active|terminated|unregistered|,)+\b$/;
const MODULE_COMMAND = /^[a-zA-Z][\w]{0,31}:[a-zA-Z][\w]{0,31}$/;
const CHAIN_ID = /^\b[a-fA-F0-9]{8}\b$/;
const CHAIN_ID_CSV = /^\b[a-fA-F0-9,]{8,}\b$/;
const TOKEN_ID = /^\b[a-fA-F0-9]{16}\b$/;
const TOKEN_ID_CSV = /^\b[a-fA-F0-9,]{16,}\b$/;
const BLS_KEY = /^\b[a-fA-F0-9]{96}\b$/;
const PROOF_OF_POSSESSION = /^\b[a-fA-F0-9]{192}\b$/;
const MODULE = /^([\w!@$&.]{1,32})(,[\w!@$&.]{1,32})*$/;
const TOPIC = /^([0-9a-fA-F]{2,64}|lsk[a-hjkm-z2-9]{38})(,([0-9a-fA-F]{2,64}|lsk[a-hjkm-z2-9]{38}))+$/;
const HEX_STRING = /^([a-fA-F0-9]+)$/;

module.exports = {
	PUBLIC_KEY,
	ADDRESS_LISK32,
	ADDRESS_LISK32_CSV,
	BLOCK_ID,
	PARTIAL_SEARCH,
	PARTIAL_SEARCH_NAME,
	NONCE,
	NAME,
	NAME_CSV,
	NETWORK_VERSION,
	OFFSET,
	TRANSACTION,
	TRANSACTION_EXECUTION_STATUS,
	POS_VALIDATOR_STATUS,
	HASH_SHA256,
	HASH_SHA512,
	IP,
	LIMIT,
	TIMESTAMP_RANGE,
	HEIGHT_RANGE,
	CCM_STATUS,
	INTERVAL,
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
	COMMAND: MODULE,
	HEX_STRING,
	FEE: NONCE,
};
