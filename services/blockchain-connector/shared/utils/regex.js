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
const BLS_KEY = /^\b[a-fA-F0-9]{96}\b$/;
const CHAIN_ID = /^\b[a-fA-F0-9]{8}\b$/;
const PROOF_OF_POSSESSION = /^\b[a-fA-F0-9]{192}\b$/;
const KEY_NOT_EXIST = /^Key [a-f0-9]+ does not exist\.$/;
const MODULE = /^[0-9a-zA-Z]{1,32}$/;
const COMMAND = MODULE;
const MODULE_CSV = /^(?:[0-9a-zA-Z]{1,32})(?:,[0-9a-zA-Z]{1,32})*$/;
const COMMAND_CSV = MODULE_CSV;
const ADDRESS_LISK32 = /^lsk[a-hjkm-z2-9]{38}$/;
const NONCE = /^\d+$/;
const HEX_STRING = /^([a-fA-F0-9]+)$/;

module.exports = {
	BLS_KEY,
	CHAIN_ID,
	PROOF_OF_POSSESSION,
	KEY_NOT_EXIST,
	MODULE,
	COMMAND,
	MODULE_CSV,
	COMMAND_CSV,
	ADDRESS_LISK32,
	NONCE,
	HEX_STRING,
};
