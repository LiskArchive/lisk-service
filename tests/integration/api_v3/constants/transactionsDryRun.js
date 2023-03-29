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
const TRANSACTION_OBJECT_VALID = {
	module: 'token',
	command: 'transfer',
	fee: '100000000',
	nonce: '0',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	signatures: [
		'846c2646a1df047b834926d43464071d13a790d30ef26f35ce1571627ae5194c403936e2b8d7ebd172452b6bdf1f5633fe5cff7e4c244b8c6dc6a9bd3cf9110f',
	],
	params: {
		recipientAddress: 'lskjokybqso65y599cbschhzmguoas2uzq2jnnbo2',
		amount: '10000000000',
		tokenID: '0400000000000000',
		data: '',
	},
	id: '5eb16c6efe8344fd18d7e4cd69f2b2a48a9ec11d04732a096fdb30e8a010362b',
};

// Invalid receipient address
const TRANSACTION_OBJECT_INVALID = {
	module: 'token',
	command: 'transfer',
	fee: '100000000',
	nonce: '0',
	senderPublicKey: '3e0c432cf0e04c31642b1a9aefde03215f778a5fe27ad102b1320b244efe4466',
	signatures: [
		'cd3e42528d47d63c643832297162e0786cfeabdf92b3adb8d33fdc40a65b1f367a93355b2a25c0abd74b26bba46c0fb47184fac2f49cd172c286836dd707af03',
	],
	params: {
		recipientAddress: 'invalid_address',
		amount: '10000000000',
		tokenID: '0400000000000000',
		data: '',
	},
	id: '449db727c5d47fdc5f4c1c56536c60e874315782c228dbf2da5850a791799f87',
};

// Transaction has less than required fee for sending token transfer to a new address
// i.e missing account initialization fee
const TRANSACTION_OBJECT_PENDING = {
	module: 'token',
	command: 'transfer',
	fee: '165000',
	nonce: '0',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	signatures: [
		'451cfcd599ad0b9621b660bea483e5b94c9d0b2a1167295e2bfe92a1fc894f447933cd7e0ef100510c5c9b38d052f5f2503eef83be3b6088fc1c8c09eb9f6d05',
	],
	params: {
		recipientAddress: 'lskjokybqso65y599cbschhzmguoas2uzq2jnnbo2',
		amount: '10000000000',
		tokenID: '0400000000000000',
		data: '',
	},
	id: 'dbfc75ea10fc3297213a104079faaa0fc983e3cf0ad05044d5f9d168ff83b172',
};

const TRANSACTION_ENCODED_VALID = '0a05746f6b656e12087472616e7366657218002080c2d72f2a203972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c322f0a0804000000000000001080c8afa0251a1402604d9e57a39772fa12f2a860ecf6c1e9cae9112207546573742074783a40d1ccc2d5fd0cd953b77c608102b7dbb6df7748474667af9e11b6aa050aa56fdc4758b9ae8fad1e0c01c6cc7d5967311e21710c53e0369e711057c09741d75804';
// Transaction has less than minimum required fee
const TRANSACTION_ENCODED_INVALID = '0a05746f6b656e12087472616e7366657218002080c2d72f2a203e0c432cf0e04c31642b1a9aefde03215f778a5fe27ad102b1320b244efe446632280a0804000000000000001080c8afa0251a14e32913576c52e2b6b466d8fbd017f066778802b822003a40cd3e42528d47d63c643832297162e0786cfeabdf92b3adb8d33fdc40a65b1f367a93355b2a25c0abd74b26bba46c0fb47184fac2f49cd172c286836dd707af03';
// Transaction has less than required fee for sending token transfer to a new address
// i.e missing account initialization fee
const TRANSACTION_ENCODED_PENDING = '0a05746f6b656e12087472616e7366657218012088890a2a203972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c32280a0804000000000000001080c8afa0251a14e32913576c52e2b6b466d8fbd017f066778802b822003a401b02722ba836d8675becd9357be69b12546d8c2583730b4cc112df54b76288990bf53312e7cf426d91ffeeaaf8c87e9e38ef7205fa16ab237208d96f2d0f0c0e';

module.exports = {
	TRANSACTION_ENCODED_VALID,
	TRANSACTION_ENCODED_INVALID,
	TRANSACTION_ENCODED_PENDING,
	TRANSACTION_OBJECT_INVALID,
	TRANSACTION_OBJECT_VALID,
	TRANSACTION_OBJECT_PENDING,
};
