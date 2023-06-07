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

const inputMultisigTransaction = {
	module: 'auth',
	command: 'registerMultisignature',
	nonce: '1',
	fee: '1500000000',
	senderPublicKey: '0b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe',
	params: {
		mandatoryKeys: [
			'4a67646a446313db964c39370359845c52fce9225a3929770ef41448c258fd39',
			'f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba3',
		],
		optionalKeys: [],
		numberOfSignatures: 2,
		signatures: [],
	},
	signatures: [
		'de49821961393ae2bedd75aad02112c6a509759f1f29940ace4889c784f5b5e58dd58f5b39bf2d2c98ce29d10e905503d5d4f454da74f57bde6d57e9a0b8850b',
		'9fcfe3f59d8c9177b8e8e4476cdca8fe31288022b0e6e93c2b8d655796dca5ce90a82dc9b33feddf868b521bc17067c53f1f70cee3ef7b508ea2cb3b02dfff0b',
	],
	id: '9ac200a99b299b4df755fcb13de7f1d8d1f02c94bc6079bf991ddd6619b54970',
};

const expectedTransaction = Object.freeze({
	...inputTransaction,
	moduleCommand: 'token:transferCrossChain',
});

module.exports = {
	inputTransaction,
	expectedTransaction,
	inputMultisigTransaction,
};
