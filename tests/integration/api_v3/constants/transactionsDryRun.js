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
	nonce: '1',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	signatures: [
		'c7fd1abf9a552fa9c91b4121c87ae2c97cb0fc0aecc87d0ee8b1aa742238eef4a6815ddba31e21144c9652a7bd5c05577ae1100eac34fba43da6fc4879b8f206',
	],
	params: {
		amount: '1000000000000',
		recipientAddress: 'lskv6v53emsaen6cwbbk226wusdpa6ojdonunka4x',
		data: '',
		tokenID: '0400000000000000',
	},
	id: 'd96c777b67576ddf4cd933a97a60b4311881e68e3c8bef1393ac0020ec8a506c',
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
	fee: '166000',
	nonce: '1',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	signatures: [
		'ea97e1131adbd6059d8922b14c1dc15a9070d28dfa36d5b492a6850a22fde2407d1d95e73785057adec5631906e2639d5e0e5974537606c9f45ce5af2e2fab06',
	],
	params: {
		amount: '1000000000000',
		recipientAddress: 'lskv6v53emsaen6cwbbk226wusdpa6ojdonunka4x',
		data: '',
		tokenID: '0400000000000000',
	},
	id: 'c537391e35f015630350b2fbeda0c63d4fa2165f481557303fa4bdb176e16303',
};

const TRANSACTION_ENCODED_VALID = '0a05746f6b656e12087472616e7366657218012080c2d72f2a203972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c32290a0804000000000000001080a094a58d1d1a141284b458bbcd8ea1dcc6a630abc37a2654ce698722003a40c7fd1abf9a552fa9c91b4121c87ae2c97cb0fc0aecc87d0ee8b1aa742238eef4a6815ddba31e21144c9652a7bd5c05577ae1100eac34fba43da6fc4879b8f206';
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
