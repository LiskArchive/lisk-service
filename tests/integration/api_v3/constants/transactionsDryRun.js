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
		'd1ccc2d5fd0cd953b77c608102b7dbb6df7748474667af9e11b6aa050aa56fdc4758b9ae8fad1e0c01c6cc7d5967311e21710c53e0369e711057c09741d75804',
	],
	params: {
		recipientAddress: 'lskz4upsnrwk75wmfurf6kbxsne2nkjqd3yzwdaup',
		amount: '10000000000',
		tokenID: '0400000000000000',
		data: 'Test tx',
	},
	id: '447c1097f099364b0535efdd4138635b4c69e549148e4adc0807616350e229b8',
};

const TRANSACTION_OBJECT_INVALID = {
	module: 'token',
	command: 'transfer',
	fee: '100000000',
	nonce: '0',
	senderPublicKey: 'a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f0',
	signatures: [
		'00000002226745847e155cf5480478c2336a43bb178439e9058cc2b50e26335cf7c8360b6c6a49793d7ae8d087bc746cab9618655e6a0adba4694cce2015b50f',
	],
	params: {
		recipientAddress: 'invalid_receipient',
		amount: '10000000000',
		tokenID: '0400000000000000',
		data: 'Test tx',
		accountInitializationFee: '5000000',
	},
	id: '2fb59d51f7b6517d3008471df13d71015dd174444ee15aa7460e8870a96ebd9c',
};

const TRANSACTION_OBJECT_FAIL = {
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

module.exports = {
	TRANSACTION_ENCODED_VALID,
	TRANSACTION_OBJECT_INVALID,
	TRANSACTION_OBJECT_VALID,
	TRANSACTION_OBJECT_FAIL,
};
