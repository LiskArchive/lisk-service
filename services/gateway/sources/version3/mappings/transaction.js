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
	moduleCommand: '=,string',
	nonce: '=,string',
	fee: '=,string',
	minFee: '=,string',
	size: '=,number',
	sender: {
		address: 'sender.address,string',
		publicKey: 'sender.publicKey,string',
		name: 'sender.name,string',
	},
	params: '=',
	block: {
		id: 'block.id,string',
		height: 'block.height,number',
		timestamp: 'block.timestamp,number',
		isFinal: 'block.isFinal,boolean',
	},
	meta: {
		recipient: {
			address: 'meta.recipient.address,string',
			publicKey: 'meta.recipient.publicKey,string',
			name: 'meta.recipient.name,string',
		},
	},
	executionStatus: '=,string',
	index: '=,number',
};
