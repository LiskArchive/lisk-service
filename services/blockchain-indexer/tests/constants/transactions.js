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
	nonce: '3',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	params: {
		tokenID: '0400000000000000',
		amount: '100000000000',
		receivingChainID: '04000001',
		recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
		data: 'Cross chain transfer',
	},
};

const inputMultisigTransaction = {
	module: 'auth',
	command: 'registerMultisignature',
	nonce: '1',
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
