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
const TIMESTAMP_RANGE = /^\b(?:[0-9]{1,}(?::[0-9]{1,})?)\b$/;
const HEIGHT_RANGE = /^\b(?:[0-9]{1,}(?::[0-9]{1,})?)\b$/;
const NAME = /^[a-z0-9!@$&_.]{1,20}$/;
const TRANSACTION_EXECUTION_STATUS = /^\b(?:pending|success|fail|,)+\b$/;
const DPOS_DELEGATE_STATUS = /^\b(?:active|standby|banned|punished|ineligible|,)+\b$/;
const NEWSFEED_SOURCE = /^\b(?:(?:drupal_lisk(?:_general|_announcements)|twitter_lisk),?)+\b$/;
const HASH_SHA256 = /^\b([A-Fa-f0-9]){1,64}\b$/;
const CCM_STATUS = /^\b(?:ok|module_not_supported|module_not_supported|channel_unavailable|recovered|,)+\b$/;
const INTERVAL = /^\b((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))(:((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31)))?\b$/g;
const CHAINID_RANGE = /^\b(?:[0-9]{1,10}(?::[0-9]{1,10})?)\b$/;
const NETWORK = /^\b(?:mainnet|testnet|betanet|,)+\b$/;
const APPLICATION_STATE = /^\b(?:registered|active|terminated|,)+\b$/;

module.exports = {
	PUBLIC_KEY,
	ADDRESS_BASE32,
	NONCE,
	NAME,
	TRANSACTION_EXECUTION_STATUS,
	DPOS_DELEGATE_STATUS,
	NEWSFEED_SOURCE,
	HASH_SHA256,
	TIMESTAMP_RANGE,
	HEIGHT_RANGE,
	CCM_STATUS,
	INTERVAL,
	CHAINID_RANGE,
	NETWORK,
	APPLICATION_STATE,
};
