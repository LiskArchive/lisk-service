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
const MODULE_TOKEN = 'token';
const COMMAND_TOKEN_TRANSFER = 'transfer';

const MODULE_DPOS = 'dpos';
const COMMAND_DPOS_VOTE_DELEGATE = 'voteDelegate';

const MODULE_AUTH = 'auth';
const COMMAND_AUTH_REGISTER_MULTISIGNATURE = 'registerMultisignature';

module.exports = {
	MODULE_TOKEN,
	COMMAND_TOKEN_TRANSFER,

	MODULE_DPOS,
	COMMAND_DPOS_VOTE_DELEGATE,

	MODULE_AUTH,
	COMMAND_AUTH_REGISTER_MULTISIGNATURE,
};
