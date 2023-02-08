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
};

const expectedTransaction = Object.freeze({
	...inputTransaction,
	moduleCommand: 'token:transfer',
});

module.exports = {
	inputTransaction,
	expectedTransaction,
};
