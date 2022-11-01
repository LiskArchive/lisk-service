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
const CHAIN_ID_PREFIX_NETWORK_MAP = Object.freeze({
	'00': 'mainnet',
	'01': 'testnet',
	'02': 'betanet',
	'03': 'alphanet',
	'04': 'devnet',
});

module.exports = {
    CHAIN_ID_PREFIX_NETWORK_MAP,
};
