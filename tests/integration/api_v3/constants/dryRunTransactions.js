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
const VALID_TRANSACTION = {
	module: 'token',
	command: 'transfer',
	fee: '100000000',
	nonce: '0',
	senderPublicKey: 'a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f0',
	signatures: [
		'48425002226745847e155cf5480478c2336a43bb178439e9058cc2b50e26335cf7c8360b6c6a49793d7ae8d087bc746cab9618655e6a0adba4694cce2015b50f',
	],
	params: {
		recipientAddress: 'lskz4upsnrwk75wmfurf6kbxsne2nkjqd3yzwdaup',
		amount: '10000000000',
		tokenID: '0400000000000000',
		data: 'Test tx',
		accountInitializationFee: '5000000',
	},
	id: '2fb59d51f7b6517d3008471df13d71015dd174444ee15aa7460e8870a96ebd9c',
};

const INVALID_TRANSACTION = {
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

const ENCODED_VALID_TRANSACTION = '0a05746f6b656e12087472616e7366657218002080c2d72f2a20a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f032340a0804000000000000001080c8afa0251a1402604d9e57a39772fa12f2a860ecf6c1e9cae91122075465737420747828c096b1023a4048425002226745847e155cf5480478c2336a43bb178439e9058cc2b50e26335cf7c8360b6c6a49793d7ae8d087bc746cab9618655e6a0adba4694cce2015b50f';

module.exports = {
	ENCODED_VALID_TRANSACTION,
	INVALID_TRANSACTION,
	VALID_TRANSACTION,
};
