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

const escrowedAmount = {
	escrowChainID: '=,string',
	tokenID: '=,string',
	amount: '=,string',
};

const supportedToken = {
	isSupportAllToken: 'data.supportedTokens.isSupportAllToken,boolean',
	exactTokenIDs: 'data.supportedTokens.exactTokenIDs',
	patternTokenIDs: 'data.supportedTokens.patternTokenIDs',
};

const totalSupplyByToken = {
	tokenID: '=,string',
	amount: 'totalSupply,string',
};

module.exports = {
	escrowedAmount,
	supportedToken,
	totalSupplyByToken,
};
