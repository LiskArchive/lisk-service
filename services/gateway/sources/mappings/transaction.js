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
	amount: '=,string',
	fee: '=,string',
	type: '=,number',
	height: '=,number',
	blockId: '=,string',
	timestamp: 'unixTimestamp,number',
	senderId: '=,string',
	senderPublicKey: '=,string',
	senderSecondPublicKey: 'asset.signature.publicKey,string',
	recipientId: '=,string',
	recipientPublicKey: '=,string',
	signature: '=,string',
	signSignature: '=,string',
	signatures: '=',
	confirmations: '=,number',
	asset: '=',
	receivedAt: '=,string',
	relays: '=,number',
	ready: '=,boolean',
};
