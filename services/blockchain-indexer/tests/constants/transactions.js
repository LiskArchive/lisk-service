/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const inputTransaction = {
	module: 'token',
	command: 'transferCrossChain',
	fee: '1000000000000',
	nonce: '3',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	signatures: [
		'342a7bb0cda369ca25cb77ec06e1ff75b41f71e8f04d0dc49eda8e9324285cd2b3383cd68cda1e7a3f1175e487f371b02492d68c91b570c7370b9d0af5e23d0c',
	],
	params: {
		tokenID: '0400000000000000',
		amount: '100000000000',
		receivingChainID: '04000001',
		recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
		data: 'Cross chain transfer',
		messageFee: '10000000',
		messageFeeTokenID: '0400000000000000',
	},
	id: '66a33a4e24a2f0a7c7af9cc334980257797efbb25cfd27408ef6ee07ab5a4a99',
};

const expectedTransaction = Object.freeze({
	...inputTransaction,
	moduleCommand: 'token:transfer',
});

module.exports = {
	inputTransaction,
	expectedTransaction,
};
