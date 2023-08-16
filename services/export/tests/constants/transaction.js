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
const reclaimTransaction = {
	id: '6cff643daaa2bd1112d1b4591abef3e62f9e4f6e37a260fcd7508ce6a06f061c',
	moduleCommand: 'legacy:reclaimLSK',
	fee: '119000',
	minFee: '165000',
	size: 165,
	nonce: '0',
	block: {
		id: 'c3a515cbfacd65402500ba423710ef9debf87f2877bd9c47d35097a9d4c28b7b',
		height: 424,
		timestamp: 1629456896,
		isFinal: true,
	},
	sender: {
		address: 'lskqz6gpqfu9tb5yc2jtqmqvqp3x8ze35g99u2zfd',
		publicKey: '10bdf57ee21ff657ab617395acab81814c3983f608bf6f0be6e626298225331d',
		name: null,
	},
	signatures: [
		'a639b29d0a28054968bd6185e0785927b0e61b90c9f88a37c9d97adfa3b3d9cef46887b7d13f52f461017ffe11462e1d11506d6904088916d61727cdc23aa503',
	],
	params: {
		amount: '16500000000',
	},
	executionStatus: 'successful',
	index: 0,
};

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

const tokenTransferTransactionSelf = {
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

const stakeTransaction = {
	id: 'c8179da88d441e876e0a60a2fb12427ed0d6ea78d50c27df8becde2a0fe0f825',
	moduleCommand: 'pos:stake',
	nonce: '0',
	fee: '20000000',
	minFee: '151000',
	size: 152,
	sender: {
		address: 'lskcgfpjvt23ygspv2fx4s8o3p2dfhm7grmqxpzx3',
		publicKey: '8f2027e3a7416e352aef5f9f204a18f70bb6c75148eb761eaf7d9950038aebb5',
		name: 'genesis_20',
	},
	params: {
		stakes: [
			{
				validatorAddress: 'lskcgfpjvt23ygspv2fx4s8o3p2dfhm7grmqxpzx3',
				amount: '100000000000',
			},
		],
	},
	block: {
		id: '27660fcce66ae954d65042bbfcfb7a7207202d1157525fdcf473c0d1cedc56c9',
		height: 698,
		timestamp: 1689775110,
		isFinal: true,
	},
	executionStatus: 'successful',
	index: 1,
};

const tokenTransferCrossChainTransaction = {
	id: '2ceda7b8ccfaa6c452651e6ba2e0a8acf88350aeeb0cde4da98701419e0657c6',
	moduleCommand: 'token:transferCrossChain',
	nonce: '4',
	fee: '100000000',
	minFee: '217000',
	size: 218,
	sender: {
		address: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
		publicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
		name: 'genesis_0',
	},
	params: {
		tokenID: '0400000000000000',
		amount: '100000000000',
		receivingChainID: '04000001',
		recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
		data: 'Cross chain transfer',
		messageFee: '10000000',
		messageFeeTokenID: '0400000000000000',
	},
	block: {
		id: '48790249bb8c73c5f74faf8fecf4130ab292fbafcd7eaf8df641981597fa9718',
		height: 215,
		timestamp: 1689691860,
		isFinal: false,
	},
	meta: {
		recipient: {
			address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
		},
	},
	executionStatus: 'successful',
	index: 1,
};

module.exports = {
	transactions: {
		reclaim: reclaimTransaction,
		tokenTransfer: tokenTransferTransaction,
		tokenTransferSelf: tokenTransferTransactionSelf,
		tokenTransferCrossChain: tokenTransferCrossChainTransaction,
		stake: stakeTransaction,
	},
};
