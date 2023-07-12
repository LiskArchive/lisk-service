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
const HASH_SHA256 = /^\b(?:[A-Fa-f0-9]){64}\b$/;
const HASH_SHA512 = /^\b(?:[A-Fa-f0-9]){128}\b$/;
const ADDRESS_LISK32 = /^lsk[a-hjkm-z2-9]{38}$/;
const ADDRESS_LISK32_CSV = /^\b(?:lsk[a-hjkm-z2-9]{38}|,)+\b$/;
const PUBLIC_KEY = HASH_SHA256;
const BLOCK_ID = HASH_SHA256;
const NONCE = /^\d+$/;
const FEE = NONCE;
const PARTIAL_SEARCH = /^[\w!@$&.]{1,64}$/; // Supports address, publicKey & name
const PARTIAL_SEARCH_NAME = /^[\w!@$&.]{1,20}$/;
const TIMESTAMP_RANGE = /^(?:(?:\d+)|(?::(?:\d+))|(?:(?:\d+):(?:\d+)?))$/;
const HEIGHT_RANGE = /^(?:(?:\d+)|(?::(?:\d+))|(?:(?:\d+):(?:\d+)?))$/;
const IP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const LIMIT = /^\b(?:(?:[1-9][0-9]?)|100)\b$/;
const OFFSET = /^\b([0-9][0-9]*)\b$/;
const NAME = /^[\w!@$&.]{3,20}$/;
const NAME_CSV = /^\b[\w!@$&.,]{3,}\b$/;
const NETWORK_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(.\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;
const TRANSACTION = /^\b[0-9a-fA-F]+\b$/;
const TRANSACTION_EXECUTION_STATUS = /^\b(?:pending|success|fail|,){0,5}\b$/;
const POS_VALIDATOR_STATUS = /^\b(?:active|standby|banned|punished|ineligible|,){0,9}\b$/;
const CCM_STATUS = /^\b(?:ok|module_not_supported|module_not_supported|channel_unavailable|recovered|,){0,9}\b$/;
const DATE_INTERVAL = /^\b(?:(?:\d{4})-(?:(?:1[012])|(?:0?[1-9]))-(?:(?:[012][1-9])|(?:[123]0)|31))(?::(?:(?:\d{4})-(?:(?:1[012])|(?:0?[1-9]))-(?:(?:[012][1-9])|(?:[123]0)|31)))?\b$/;
const NETWORK_CSV = /^\b(?:mainnet|testnet|betanet|alphanet|devnet|,){0,9}\b$/;
const APPLICATION_STATUS = /^\b(?:registered|active|terminated|unregistered|,){1,7}\b$/;
const MODULE_COMMAND = /^[0-9a-zA-Z]{0,32}:[0-9a-zA-Z]{0,32}$/;
const CHAIN_ID = /^\b[a-fA-F0-9]{8}\b$/;
const CHAIN_ID_CSV = /^\b(?:[a-fA-F0-9]{8}|,)+\b$/;
const TOKEN_ID = /^\b[a-fA-F0-9]{16}\b$/;
const TOKEN_ID_CSV = /^\b(?:[a-fA-F0-9]{16}|,)+\b$/;
const BLS_KEY = /^\b[a-fA-F0-9]{96}\b$/;
const PROOF_OF_POSSESSION = /^\b[a-fA-F0-9]{192}\b$/;
const MODULE = /^[0-9a-zA-Z]{1,32}$/;
const COMMAND = MODULE;
const MODULE_CSV = /^(?:[0-9a-zA-Z]{1,32})(?:,[0-9a-zA-Z]{1,32})*$/;
const COMMAND_CSV = MODULE_CSV;
const TOPIC_CSV = /^\b(?:[0-9a-fA-F]{2,64}|lsk[a-hjkm-z2-9]{38})(?:,(?:[0-9a-fA-F]{2,64}|lsk[a-hjkm-z2-9]{38}))*\b$/;
const HEX_STRING = /^\b[a-fA-F0-9]+\b$/;
const CSV_EXPORT_FILENAME = /^transactions_(lsk[a-hjkm-z2-9]{38})_(\d{4}-(0[1-9]|1[0-2])-([0-2][1-9]|3[01]))_(\d{4}-(0[1-9]|1[0-2])-([0-2][1-9]|3[01]))\.csv$/;

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
	DATE_INTERVAL,
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
	COMMAND,
	MODULE_CSV,
	COMMAND_CSV,
	TOPIC_CSV,
	HEX_STRING,
	FEE,
	CSV_EXPORT_FILENAME,
};
