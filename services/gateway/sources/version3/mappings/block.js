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
	generatorAddress: '=,string',
	transactionRoot: '=,string',
	assetsRoot: '=,string',
	stateRoot: '=,string',
	maxHeightPrevoted: '=,string',
	maxHeightGenerated: '=,string',
	validatorsHash: '=,string',
	aggregateCommit: {
		height: '=,string',
		aggregationBits: '=,string',
		certificateSignature: '=,string',
	},
	signature: '=,string',
	isFinal: '=,boolean',
};
