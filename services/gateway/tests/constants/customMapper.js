/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const rootObj = {
	data: {
		escrowedAmounts: [
			{
				escrowChainID: '04000000',
				tokenID: '0400000000000000',
				amount: '456000',
			},
		],
		supportedTokens: {
			isSupportAllTokens: false,
			exactTokenIDs: [
				'0400000000000000',
			],
			patternTokenIDs: [

			],
		},
		totalSupply: [
			{
				tokenID: '0400000000000000',
				totalSupply: '10300329000000000',
			},
		],
	},
	meta: {

	},
};

const mapObjectDefinition = {
	data: {
		escrowedAmounts: [
			'data.escrowedAmounts',
			{
				escrowChainID: '=,string',
				tokenID: '=,string',
				CUSTOM_KEY_AMOUNT: 'amount,string',
			},
		],
		supportedTokens: {
			isSupportAllTokens: 'data.supportedTokens.isSupportAllTokens,boolean',
			patternTokenIDs: 'data.supportedTokens.patternTokenIDs',
			exactTokenIDs: 'data.supportedTokens.exactTokenIDs',
		},
		totalSupply: [
			'data.totalSupply',
			{
				tokenID: '=,string',
				amount: 'totalSupply,string',
			},
		],
	},
	meta: {

	},
	links: {

	},
};

const mapObjectExpectedResponse = {
	data: {
		escrowedAmounts: [
			{
				escrowChainID: '04000000',
				tokenID: '0400000000000000',
				CUSTOM_KEY_AMOUNT: '456000',
			},
		],
		supportedTokens: {
			isSupportAllTokens: false,
			patternTokenIDs: [

			],
			exactTokenIDs: [
				'0400000000000000',
			],
		},
		totalSupply: [
			{
				tokenID: '0400000000000000',
				amount: '10300329000000000',
			},
		],
	},
};

module.exports = {
	rootObj,
	mapObjectDefinition,
	mapObjectExpectedResponse,
};
