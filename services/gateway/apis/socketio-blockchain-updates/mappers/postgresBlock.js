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
	version: '=,string',
	reward: '=,number',
	payloadHash: '=,hex',
	timestamp: 'unixtime,number',
	previousBlock: '=,string',
	generatorAddress: 'senderId,string',
	generatorPublicKey: '=,hex',
	generatorUsername: 'username,string',
	blockSignature: '=,hex',
	height: '=,number',
	id: '=,string',
	relays: '=,number',
	totalAmount: '=,string',
	totalFee: '=,string',
	numberOfTransactions: '=,number',
	payloadLength: '=,number',
	transactions: [],
};
