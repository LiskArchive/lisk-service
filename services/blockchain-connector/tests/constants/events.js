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
	data: '0a14fc18da54f6ce01bf31195548460361dfdb83c20512143f6e3beaa717edb0b445e64c79f5829bcdbf6b031a08040000000000000020b0d3cc2f2800',
	index: 1,
	module: 'token',
	name: 'transfer',
	topics: [
		'66870fa27b22c361094ff2d72a794b3d7e531c02a488271c38d02180c05e3c69',
		'fc18da54f6ce01bf31195548460361dfdb83c205',
		'3f6e3beaa717edb0b445e64c79f5829bcdbf6b03',
	],
	height: 6,
};

const decodedTransferEvent = {
	data: {
		senderAddress: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
		recipientAddress: 'lsknhwcwdqnvgesx9vmjabnthovt8bsfd2cqsj9mj',
		tokenID: '0400000000000000',
		amount: '99822000',
		result: 0,
	},
	index: 1,
	module: 'token',
	name: 'transfer',
	topics: [
		'66870fa27b22c361094ff2d72a794b3d7e531c02a488271c38d02180c05e3c69',
		'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
		'lsknhwcwdqnvgesx9vmjabnthovt8bsfd2cqsj9mj',
	],
	height: 6,
	id: 'e4fccc02c331a71b2d36a44f2cb7358e161ce6e11d8d7ee312af4e56a21e7fe4',
};

module.exports = {
	transferEventInput,
	decodedTransferEvent,
};
