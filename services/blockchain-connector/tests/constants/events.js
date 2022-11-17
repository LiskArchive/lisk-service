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

const encodedTransferEvent = '0a05746f6b656e120d7472616e736665724576656e741a7a306131346232663735623639363866363837623439356236396531666563353164303666613861653964386431323038303030303030303030303030303030303138663862386364326632323134653463633365633036323936623162376437386337613263653963383936326165646162653535613238303022403836616663646436343038343662663431353235343831393338363533656539343262653366616331656362636666303865393866396165646133613935383322286232663735623639363866363837623439356236396531666563353164303666613861653964386422103030303030303030303030303030303022286565346230633932333166306539316661633466383264383965373265643330613462333333656528173000';

module.exports = {
	transferEventInput,
	decodedTransferEvent,
	encodedTransferEvent,
};
