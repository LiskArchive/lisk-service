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
const transaction = Object.freeze({
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
});

const decodedTransaction = Object.freeze({
	module: 'token',
	command: 'transfer',
	fee: '100000000',
	nonce: '1',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	signatures: [
		'c7fd1abf9a552fa9c91b4121c87ae2c97cb0fc0aecc87d0ee8b1aa742238eef4a6815ddba31e21144c9652a7bd5c05577ae1100eac34fba43da6fc4879b8f206',
	],
	params: {
		tokenID: '0400000000000000',
		amount: '1000000000000',
		recipientAddress: 'lskv6v53emsaen6cwbbk226wusdpa6ojdonunka4x',
		data: '',
	},
	id: 'd96c777b67576ddf4cd933a97a60b4311881e68e3c8bef1393ac0020ec8a506c',
	size: 167,
	minFee: '166000',
});

const invalidTransaction = Object.freeze({
	moduleID: 2,
	commandID: 0,
	nonce: '4',
	fee: '200000',
	senderPublicKey: '41e9303d6e871e066f58f4900422b802cf98ee9035a070f92baa1aa7b55728a8',
	asset: {
		amount: '752291501',
		recipientAddress: '60db70ee3f962d518096127ed73b8b8ac9441a28',
		data: '',
	},
	id: 'a6ba9d89d8e57bc921dd56417313a01fa7834f12cdbcebdfda58c7b385397d96',
});

const encodedTransaction =
	'0a05746f6b656e12087472616e7366657218012080c2d72f2a203972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c32290a0804000000000000001080a094a58d1d1a141284b458bbcd8ea1dcc6a630abc37a2654ce698722003a40c7fd1abf9a552fa9c91b4121c87ae2c97cb0fc0aecc87d0ee8b1aa742238eef4a6815ddba31e21144c9652a7bd5c05577ae1100eac34fba43da6fc4879b8f206';

const invalidEncodedTransaction =
	'08021000180420c09a0c2a2041e9303d6e871e066f58f4900422b802cf98ee9035a070f92baa1aa7b55728a8321e08ad9ddce602121460db70ee3f962d518096127ed73b8b8ac9441a281a003a40fb02e7a125d20909a449be226cb8f7cc17085b98414584e3422d3405bd83d0dc0aa108ecaf1af01825dbbb632d85bf6bd0f7bbbc9fd81519485679dda78f7006';

module.exports = {
	transaction,
	invalidTransaction,
	encodedTransaction,
	decodedTransaction,
	invalidEncodedTransaction,
};
