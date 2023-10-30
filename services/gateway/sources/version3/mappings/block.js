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
module.exports = {
	id: '=,string',
	version: '=,number',
	timestamp: '=,number',
	height: '=,number',
	previousBlockID: '=,string',
	generator: {
		address: '=,string',
		name: '=,string',
		publicKey: '=,string',
	},
	transactionRoot: '=,string',
	assetRoot: '=,string',
	stateRoot: '=,string',
	eventRoot: '=,string',
	maxHeightPrevoted: '=,number',
	maxHeightGenerated: '=,number',
	validatorsHash: '=,string',
	aggregateCommit: {
		height: '=,number',
		aggregationBits: '=,string',
		certificateSignature: '=,string',
	},
	numberOfTransactions: '=,number',
	numberOfAssets: '=,number',
	numberOfEvents: '=,number',
	totalForged: '=,string',
	totalBurnt: '=,string',
	networkFee: '=,string',
	signature: '=,string',
	reward: '=,string',
	isFinal: '=,boolean',
};
