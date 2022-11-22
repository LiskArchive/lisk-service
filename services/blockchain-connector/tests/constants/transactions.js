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
const transaction = {
	module: 'token',
	command: 'transfer',
	nonce: '0',
	fee: '100000000',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	params: '0a0804000000000000001080c8afa0251a1402604d9e57a39772fa12f2a860ecf6c1e9cae91122075465737420747828c096b102',
	signatures: [
		'a7e332b49db6d36c1024a24afbfd6eec2451e41c1cf751a8c609863ffa3e529ef4b8a34cecff29e9fa4bf30de4ce26f58c5d8a06587582a9129a6765064d3404',
	],
	id: '66870fa27b22c361094ff2d72a794b3d7e531c02a488271c38d02180c05e3c69',
};

const decodedTransaction = {
	module: 'token',
	command: 'transfer',
	nonce: '0',
	fee: '100000000',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	params: {
		tokenID: '0400000000000000',
		amount: '10000000000',
		recipientAddress: 'lskz4upsnrwk75wmfurf6kbxsne2nkjqd3yzwdaup',
		data: 'Test tx',
		accountInitializationFee: '5000000',
	},
	signatures: [
		'a7e332b49db6d36c1024a24afbfd6eec2451e41c1cf751a8c609863ffa3e529ef4b8a34cecff29e9fa4bf30de4ce26f58c5d8a06587582a9129a6765064d3404',
	],
	id: '66870fa27b22c361094ff2d72a794b3d7e531c02a488271c38d02180c05e3c69',
	size: 178,
	minFee: '177000',
};

const invalidTransaction = {
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
};

const encodedTransaction = '0a05746f6b656e12087472616e7366657218002080c2d72f2a203972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c32003a40a7e332b49db6d36c1024a24afbfd6eec2451e41c1cf751a8c609863ffa3e529ef4b8a34cecff29e9fa4bf30de4ce26f58c5d8a06587582a9129a6765064d3404';

const invalidEncodedTransaction = '08021000180420c09a0c2a2041e9303d6e871e066f58f4900422b802cf98ee9035a070f92baa1aa7b55728a8321e08ad9ddce602121460db70ee3f962d518096127ed73b8b8ac9441a281a003a40fb02e7a125d20909a449be226cb8f7cc17085b98414584e3422d3405bd83d0dc0aa108ecaf1af01825dbbb632d85bf6bd0f7bbbc9fd81519485679dda78f7006';

module.exports = {
	transaction,
	invalidTransaction,
	encodedTransaction,
	decodedTransaction,
	invalidEncodedTransaction,
};
