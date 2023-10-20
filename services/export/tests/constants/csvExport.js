/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const generateExcpectedCsv = (json, delimiter) =>
	''.concat(
		Object.keys(json)
			.map(k => (typeof k === 'number' ? k : `"${k}"`))
			.join(delimiter),
		'\n',
		Object.values(json)
			.map(k => (typeof k === 'number' || !k ? k : `"${k}"`))
			.join(delimiter),
	);

const tokenTransferTransaction = {
	id: 'd41e8fbb909fdf44ffccef6f5b0fb5edf853f0dcf699243a0a92403d2a4f1d1d',
	moduleCommand: 'token:transfer',
	nonce: '3',
	fee: '167000',
	minFee: '165000',
	size: 165,
	sender: {
		address: 'lskxud8mwmw4et3zhrr6cee9q4d8thhe2b3x6yqdp',
		publicKey: '1a315a7c7ccfb44ee0730f22cac4370307a7ef29710b938cff52e653cac753ad',
		name: null,
	},
	params: {
		tokenID: '0400000000000000',
		amount: '1200000000',
		recipientAddress: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
		data: '',
	},
	block: {
		id: '227c65bb47ba5a061a98ea9c459be750ba4e66a36c68e2c45b096fdeb6bb29fc',
		height: 1745,
		timestamp: 1689785580,
		isFinal: true,
	},
	meta: {
		recipient: {
			address: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
			publicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
			name: 'genesis_0',
		},
	},
	executionStatus: 'successful',
	index: 0,
};

const selfTokenTransferTransaction = {
	id: 'd41e8fbb909fdf44ffccef6f5b0fb5edf853f0dcf699243a0a92403d2a4f1d1d',
	moduleCommand: 'token:transfer',
	nonce: '3',
	fee: '167000',
	minFee: '165000',
	size: 165,
	sender: {
		address: 'lskxud8mwmw4et3zhrr6cee9q4d8thhe2b3x6yqdp',
		publicKey: '1a315a7c7ccfb44ee0730f22cac4370307a7ef29710b938cff52e653cac753ad',
		name: null,
	},
	params: {
		tokenID: '0400000000000000',
		amount: '1200000000',
		recipientAddress: 'lskxud8mwmw4et3zhrr6cee9q4d8thhe2b3x6yqdp',
		data: '',
	},
	block: {
		id: '227c65bb47ba5a061a98ea9c459be750ba4e66a36c68e2c45b096fdeb6bb29fc',
		height: 1745,
		timestamp: 1689785580,
		isFinal: true,
	},
	meta: {
		recipient: {
			address: 'lskxud8mwmw4et3zhrr6cee9q4d8thhe2b3x6yqdp',
			publicKey: '1a315a7c7ccfb44ee0730f22cac4370307a7ef29710b938cff52e653cac753ad',
			name: 'genesis_0',
		},
	},
	executionStatus: 'successful',
	index: 0,
};

const interval = {
	startEnd: '2021-06-07:2021-09-19',
	onlyStart: '2021-06-07',
};

module.exports = {
	generateExcpectedCsv,
	tokenTransfer: {
		toSelf: {
			transaction: selfTokenTransferTransaction,
			sender: selfTokenTransferTransaction.sender.address,
		},
		toOther: {
			transaction: tokenTransferTransaction,
			sender: tokenTransferTransaction.sender.address,
		},
	},
	interval,
};
