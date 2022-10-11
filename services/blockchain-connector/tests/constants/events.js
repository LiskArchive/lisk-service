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
const transferEventInput = {
	data: '0a14b2f75b6968f687b495b69e1fec51d06fa8ae9d8d1208000000000000000018f8b8cd2f2214e4cc3ec06296b1b7d78c7a2ce9c8962aedabe55a2800',
	height: 23,
	index: 0,
	module: 'token',
	name: 'transferEvent',
	topics: ['86afcdd640846bf41525481938653ee942be3fac1ecbcff08e98f9aeda3a9583',
		'b2f75b6968f687b495b69e1fec51d06fa8ae9d8d',
		'0000000000000000',
		'ee4b0c9231f0e91fac4f82d89e72ed30a4b333ee'],
};

const decodedTransferEventData = {
	senderAddress: 'b2f75b6968f687b495b69e1fec51d06fa8ae9d8d',
	tokenID: '0000000000000000',
	amount: '99835000',
	recipientAddress: 'e4cc3ec06296b1b7d78c7a2ce9c8962aedabe55a',
	result: 0,
};

const encodedTransferEvent = '0a05746f6b656e120d7472616e736665724576656e741a7a306131346232663735623639363866363837623439356236396531666563353164303666613861653964386431323038303030303030303030303030303030303138663862386364326632323134653463633365633036323936623162376437386337613263653963383936326165646162653535613238303022403836616663646436343038343662663431353235343831393338363533656539343262653366616331656362636666303865393866396165646133613935383322286232663735623639363866363837623439356236396531666563353164303666613861653964386422103030303030303030303030303030303022286565346230633932333166306539316661633466383264383965373265643330613462333333656528173000';

const transferEventSchema = {
	$id: '/token/events/transfer',
	type: 'object',
	required: ['senderAddress', 'recipientAddress', 'tokenID', 'amount', 'result'],
	properties: {
		senderAddress: {
			dataType: 'bytes',
			fieldNumber: 1 },
		tokenID: {
			dataType: 'bytes',
			fieldNumber: 2,
		},
		amount: { dataType: 'uint64', fieldNumber: 3 },
		recipientAddress: { dataType: 'bytes', fieldNumber: 4 },
		result: {
			dataType: 'uint32',
			fieldNumber: 5,
		},
	},
};

module.exports = {
	transferEventInput,
	decodedTransferEventData,
	encodedTransferEvent,
	transferEventSchema,
};
