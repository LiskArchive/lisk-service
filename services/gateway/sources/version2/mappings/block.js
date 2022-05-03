/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
module.exports = {
	header: {
		id: '=,string',
		height: '=,number',
		version: '=,number',
		timestamp: '=,number',
		generatorAddress: '=,string',
		generatorPublicKey: '=,string',
		generatorUsername: '=,string',
		validatorsHash: '=,string',
		assetsRoot: '=,string',
		stateRoot: '=,string',
		maxHeightGenerated: '=,string',
		aggregateCommit: '=',
		transactionRoot: '=,string',
		payloadLength: '=,number',
		payloadHash: '=,string',
		signature: '=,string',
		blockSignature: '=,string',
		confirmations: '=,number',
		previousBlockId: 'previousBlockID,string',
		numberOfTransactions: '=,number',
		totalAmount: '=,string',
		totalForged: '=,string',
		totalBurnt: '=,string',
		totalFee: '=,string',
		reward: '=,string',
		isFinal: '=,boolean',
		maxHeightPreviouslyForged: 'asset.maxHeightPreviouslyForged,number',
		maxHeightPrevoted: 'asset.maxHeightPrevoted,number',
		seedReveal: 'asset.seedReveal,string',
	},
	assets: '=',
};
