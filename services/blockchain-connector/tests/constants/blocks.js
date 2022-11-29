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
const blockWithTransaction = Object.freeze({
	header: {
		version: 2,
		timestamp: 1668685948,
		height: 15,
		previousBlockID: 'ecd7dd76778e558bce1d891029ddbec14ff61b58f255366aad9b0edae91eab6f',
		stateRoot: 'dcf9badce634516121b167dbfc5f38c18f1b553ca7226333abaa643a44563030',
		assetRoot: '7cf1a34dd0a9ee4b9b523c1d7b283885bcbcb611d67abdf09740e4ab811fa8d8',
		eventRoot: '85bc35bbb2e462529a16a0e5f316b61274065fa4d474c000615c92ac317eb650',
		transactionRoot: '3f84c4fc1ea0756e03f166871719556d6437d12f0908d6e3846dce54f2cc9c73',
		validatorsHash: '1a450b4a730015a6ffc4d6af31c6e94a29e578bd5cbc969ecf47432967c4983b',
		aggregateCommit: {
			height: 0,
			aggregationBits: '',
			certificateSignature: '',
		},
		generatorAddress: 'lsko3c2fm656v3k4mvh7tzadn6rskcuj9sfgmkdwb',
		maxHeightPrevoted: 0,
		maxHeightGenerated: 0,
		impliesMaxPrevotes: true,
		signature: '82e8916fc8a839518cb9e2a2c7b092c40e7d0ade90de8ec99925efc1a1480927d51dc2c889f755e0eef5425689be6edb2f2cbe726fcbb60aaebf7f5c24b52809',
		id: 'c1c7c28f5b123135cb5a25f210390f200cd0ed7cc901c0b5997f084e2998c9cc',
	},
	transactions: [
		{
			module: 'token',
			command: 'transfer',
			params: '0a0804000000000000001080c8afa0251a1402604d9e57a39772fa12f2a860ecf6c1e9cae91122075465737420747828c096b102',
			nonce: '0',
			fee: '100000000',
			senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
			signatures: [
				'a7e332b49db6d36c1024a24afbfd6eec2451e41c1cf751a8c609863ffa3e529ef4b8a34cecff29e9fa4bf30de4ce26f58c5d8a06587582a9129a6765064d3404',
			],
			id: '66870fa27b22c361094ff2d72a794b3d7e531c02a488271c38d02180c05e3c69',
		},
	],
	assets: [
		{
			module: 'random',
			data: '0a1070a75d7aa0f69bde310829add0a5930f',
		},
	],
});

const decodedBlockWithTransaction = Object.freeze({
	header: {
		version: 2,
		timestamp: 1668685948,
		height: 15,
		previousBlockID: 'ecd7dd76778e558bce1d891029ddbec14ff61b58f255366aad9b0edae91eab6f',
		stateRoot: 'dcf9badce634516121b167dbfc5f38c18f1b553ca7226333abaa643a44563030',
		assetRoot: '7cf1a34dd0a9ee4b9b523c1d7b283885bcbcb611d67abdf09740e4ab811fa8d8',
		eventRoot: '85bc35bbb2e462529a16a0e5f316b61274065fa4d474c000615c92ac317eb650',
		transactionRoot: '3f84c4fc1ea0756e03f166871719556d6437d12f0908d6e3846dce54f2cc9c73',
		validatorsHash: '1a450b4a730015a6ffc4d6af31c6e94a29e578bd5cbc969ecf47432967c4983b',
		aggregateCommit: {
			height: 0,
			aggregationBits: '',
			certificateSignature: '',
		},
		generatorAddress: 'lsko3c2fm656v3k4mvh7tzadn6rskcuj9sfgmkdwb',
		maxHeightPrevoted: 0,
		maxHeightGenerated: 0,
		impliesMaxPrevotes: true,
		signature: '82e8916fc8a839518cb9e2a2c7b092c40e7d0ade90de8ec99925efc1a1480927d51dc2c889f755e0eef5425689be6edb2f2cbe726fcbb60aaebf7f5c24b52809',
		id: 'c1c7c28f5b123135cb5a25f210390f200cd0ed7cc901c0b5997f084e2998c9cc',
	},
	assets: [
		{
			module: 'random',
			data: {
				seedReveal: '70a75d7aa0f69bde310829add0a5930f',
			},
		},
	],
	transactions: [
		{
			module: 'token',
			command: 'transfer',
			params: {
				tokenID: '0400000000000000',
				amount: '10000000000',
				recipientAddress: 'lskz4upsnrwk75wmfurf6kbxsne2nkjqd3yzwdaup',
				data: 'Test tx',
				accountInitializationFee: '5000000',
			},
			nonce: '0',
			fee: '100000000',
			senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
			signatures: [
				'a7e332b49db6d36c1024a24afbfd6eec2451e41c1cf751a8c609863ffa3e529ef4b8a34cecff29e9fa4bf30de4ce26f58c5d8a06587582a9129a6765064d3404',
			],
			id: '66870fa27b22c361094ff2d72a794b3d7e531c02a488271c38d02180c05e3c69',
			size: 178,
			minFee: '177000',
		},
	],
});

const blockWithoutTransaction = Object.freeze({
	header: {
		version: 2,
		timestamp: 1668688464,
		height: 1,
		previousBlockID: '1eace31bf5b0aba50346b2e94ea2413048cf9e1d7ba9cdace73dca6de057fd0d',
		stateRoot: '8e9a20a8abf0ad8e3f57c8e806231b990c5792fabc76111b1fb50f68facbcb0b',
		assetRoot: '3e439cda45c5846faac7a42385264912c44190dbc44716ed0921c84433ee6e54',
		eventRoot: '9f9beac10348901bdf7a1665cf9eb70d9d696d4f562dc1ea334b6298bcb4220a',
		transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		validatorsHash: '1a450b4a730015a6ffc4d6af31c6e94a29e578bd5cbc969ecf47432967c4983b',
		aggregateCommit: {
			height: 0,
			aggregationBits: '',
			certificateSignature: '',
		},
		generatorAddress: 'lskhkz6skcauwbczqk9c744gr6uro5f7k4sbawzac',
		maxHeightPrevoted: 0,
		maxHeightGenerated: 0,
		impliesMaxPrevotes: true,
		signature: '274585e5e93fefa239766d7ca2720fed9118c6c53e95d3ec8d47bbe6c3194d7fe86d6e2d3e8d440e5637da0d1212d6d58985cbc21eb3536e7e67f56bd0582e06',
		id: '1363799498535e4e565673855e1a740da99bf910fcaf7b9b9fdf3de7e14a836b',
	},
	transactions: [],
	assets: [
		{
			module: 'random',
			data: '0a10ff107946ad4dbbf462f9f69732a28098',
		},
	],
});

const decodedBlockWithoutTransaction = Object.freeze({
	header: {
		version: 2,
		timestamp: 1668688464,
		height: 1,
		previousBlockID: '1eace31bf5b0aba50346b2e94ea2413048cf9e1d7ba9cdace73dca6de057fd0d',
		stateRoot: '8e9a20a8abf0ad8e3f57c8e806231b990c5792fabc76111b1fb50f68facbcb0b',
		assetRoot: '3e439cda45c5846faac7a42385264912c44190dbc44716ed0921c84433ee6e54',
		eventRoot: '9f9beac10348901bdf7a1665cf9eb70d9d696d4f562dc1ea334b6298bcb4220a',
		transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		validatorsHash: '1a450b4a730015a6ffc4d6af31c6e94a29e578bd5cbc969ecf47432967c4983b',
		aggregateCommit: {
			height: 0,
			aggregationBits: '',
			certificateSignature: '',
		},
		generatorAddress: 'lskhkz6skcauwbczqk9c744gr6uro5f7k4sbawzac',
		maxHeightPrevoted: 0,
		maxHeightGenerated: 0,
		impliesMaxPrevotes: true,
		signature: '274585e5e93fefa239766d7ca2720fed9118c6c53e95d3ec8d47bbe6c3194d7fe86d6e2d3e8d440e5637da0d1212d6d58985cbc21eb3536e7e67f56bd0582e06',
		id: '1363799498535e4e565673855e1a740da99bf910fcaf7b9b9fdf3de7e14a836b',
	},
	assets: [
		{
			module: 'random',
			data: {
				seedReveal: 'ff107946ad4dbbf462f9f69732a28098',
			},
		},
	],
	transactions: [],
});

const invalidBlock = Object.freeze({
	header: {
		version: 2,
		timestamp: 1649855393,
		height: 1,
		previousBlockID: '2d7c1de74a7353a8bea6f1af1620e5bbb9f6170fa4b5376267f8fb3d0e314d32',
		generatorPublicKey: '1348bdced23cbdfb92cf3c74742d8f3d96f436de',
		transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		assetsRoot: 'e626f31527f88edd955c3ce5b6eea63f8c1d2fb6ddd329eac0b81d9ab0919b77',
		stateRoot: '41e6b1c0cd1eb398e64a0af03f1b6547096fb005669b35985776d8f1c2564107',
		maxHeightPrevoted: 0,
		maxHeightGenerated: 0,
		aggregateCommit: {
			height: 0,
			aggregationBits: '',
			certificateSignature: '',
		},
		id: '0e448a300f46b3ac5206d5fff55cc145cf33073061f4c838d21fa4230a8e2019',
	},
	assets: [
		{
			moduleID: 15,
			data: '0a10a21eee43f81c4bc447ee6f43cf2b0f5f',
		},
	],
	transactions: [],
});

const invalidEncodedBlock = '80210a197db9206180122202d7c1de74a7353a8bea6f1af1620e5bbb9f6170fa4b5376267f8fb3d0e314d322a141348bdced232cf3c74742d8f3d96f436de3220e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8553a20e626f31527f88edd955c3ce5b6eea63f8c1d2fb6ddd329eac0b81d9ab0919b77422041e6b1c0cd1eb398e64a0af03f1b6547096fb005669b35985776d8f1c2564107480050005a20f89987de86e18d8391339c3b92c796ae7d0f7a75f8d57b2392539cc3c39e5ffe6206080012001a006a40efb32235a979a770225cc996b8419c135d10c61a789b5672f9b943637eb735b46cd37b39bfa598831932f15ff7e52a955fbe4756c3e0a83e0da8dd54065e74041a16080f12120a10a21eee43f81c4bc447ee5f';

module.exports = {
	invalidBlock,
	blockWithTransaction,
	decodedBlockWithTransaction,
	blockWithoutTransaction,
	decodedBlockWithoutTransaction,
	invalidEncodedBlock,
};
