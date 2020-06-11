/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
	height: '=,number',
	version: '=,number',
	timestamp: 'unixTimestamp,number',
	generatorAddress: '=,string',
	generatorPublicKey: '=,string',
	generatorUsername: '=,string',
	payloadLength: '=,number',
	payloadHash: '=,string',
	blockSignature: '=,string',
	confirmations: '=,number',
	previousBlockId: '=,string',
	numberOfTransactions: '=,number',
	totalAmount: '=,string',
	totalFee: '=,string',
	reward: '=,string',
	totalForged: '=,string',
};
