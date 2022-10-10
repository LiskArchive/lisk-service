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
const transferventInput = {
	data: '0a14b2f75b6968f687b495b69e1fec51d06fa8ae9d8d1208000000000000000018f8b8cd2f22149021083ff422cc1918c06f75c0df11e9c81d53402800',
	height: 4,
	index: 0,
	module: 'token',
	name: 'transferEvent',
};

const decodedTransferEvent = {
	senderAddress: 'dummy',
	tokenID: 'dummy',
	amount: 1,
	recipientAddress: 'dummy',
	result: 0,
};

module.exports = {
    transferventInput,
    decodedTransferEvent,
};