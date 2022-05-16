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
const block = {
	header: {
		version: 2,
		timestamp: 1649855393,
		height: 1,
		previousBlockID: '2d7c1de74a7353a8bea6f1af1620e5bbb9f6170fa4b5376267f8fb3d0e314d32',
		generatorAddress: '1348bdced23cbdfb92cf3c74742d8f3d96f436de',
		transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		assetsRoot: 'e626f31527f88edd955c3ce5b6eea63f8c1d2fb6ddd329eac0b81d9ab0919b77',
		stateRoot: '41e6b1c0cd1eb398e64a0af03f1b6547096fb005669b35985776d8f1c2564107',
		maxHeightPrevoted: 0,
		maxHeightGenerated: 0,
		validatorsHash: 'f89987de86e18d8391339c3b92c796ae7d0f7a75f8d57b2392539cc3c39e5ffe',
		aggregateCommit: {
			height: 0,
			aggregationBits: '',
			certificateSignature: '',
		},
		signature: 'efb32235a979a770225cc996b8419c135d10c61a789b5672f9b943637eb735b46cd37b39bfa598831932f15ff7e52a955fbe4756c3e0a83e0da8dd54065e7404',
		id: '0e448a300f46b3ac5206d5fff55cc145cf33073061f4c838d21fa4230a8e2019',
	},
	assets: [
		{
			moduleID: 15,
			data: '0a10a21eee43f81c4bc447ee6f43cf2b0f5f',
		},
	],
	transactions: [],
};

const blockWithTransaction = {
	header: {
		version: 2,
		timestamp: 1649855393,
		height: 1,
		previousBlockID: '2d7c1de74a7353a8bea6f1af1620e5bbb9f6170fa4b5376267f8fb3d0e314d32',
		generatorAddress: '1348bdced23cbdfb92cf3c74742d8f3d96f436de',
		transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		assetsRoot: 'e626f31527f88edd955c3ce5b6eea63f8c1d2fb6ddd329eac0b81d9ab0919b77',
		stateRoot: '41e6b1c0cd1eb398e64a0af03f1b6547096fb005669b35985776d8f1c2564107',
		maxHeightPrevoted: 0,
		maxHeightGenerated: 0,
		validatorsHash: 'f89987de86e18d8391339c3b92c796ae7d0f7a75f8d57b2392539cc3c39e5ffe',
		aggregateCommit: {
			height: 0,
			aggregationBits: '',
			certificateSignature: '',
		},
		signature: 'efb32235a979a770225cc996b8419c135d10c61a789b5672f9b943637eb735b46cd37b39bfa598831932f15ff7e52a955fbe4756c3e0a83e0da8dd54065e7404',
		id: '0e448a300f46b3ac5206d5fff55cc145cf33073061f4c838d21fa4230a8e2019',
	},
	assets: [
		{
			moduleID: 15,
			data: '0a10a21eee43f81c4bc447ee6f43cf2b0f5f',
		},
	],
	transactions: [{
		moduleID: 2,
		commandID: 0,
		nonce: '4',
		fee: '200000',
		senderPublicKey: '41e9303d6e871e066f58f4900422b802cf98ee9035a070f92baa1aa7b55728a8',
		params: {
			amount: '752291501',
			recipientAddress: '60db70ee3f962d518096127ed73b8b8ac9441a28',
			data: '',
		},
		signatures: [
			'fb02e7a125d20909a449be226cb8f7cc17085b98414584e3422d3405bd83d0dc0aa108ecaf1af01825dbbb632d85bf6bd0f7bbbc9fd81519485679dda78f7006',
		],
		id: 'a6ba9d89d8e57bc921dd56417313a01fa7834f12cdbcebdfda58c7b385397d96',
	}],
};

const encodedBlock = '0a9802080210a3bc889406183c22209656e57617ebd2589c53fe031215d33707f97e01f0db422206ae7c4b9c83d20b2a141348bdced23cbdfb92cf3c74742d8f3d96f436de3220e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8553a2014b3909d669f7e0e8333fb1d098af736bf30be75d3c9e44ccde863d785960ee44220f81b6777fc5959d035fbbc17a26e3e8fc8ab519eb7d67f7f97ac07ecb4a97d92480050435a20f89987de86e18d8391339c3b92c796ae7d0f7a75f8d57b2392539cc3c39e5ffe6206080012001a006a4033e40bfeaae5e6733712b2ed692cc9a9b35cf5ec8c15432347d9caf6a2cc9a334bf490fc6e817e2b9082bf9d7ddd74ecc1f5c4b50a973a05183e2c3bee2eff0e1a16080f12120a10a21eee43f81c4bc447ee6f43cf2b0f5f';

const encodedBlockWithTransaction = '0a9802080210a3bc889406183c22209656e57617ebd2589c53fe031215d33707f97e01f0db422206ae7c4b9c83d20b2a141348bdced23cbdfb92cf3c74742d8f3d96f436de3220e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8553a2014b3909d669f7e0e8333fb1d098af736bf30be75d3c9e44ccde863d785960ee44220f81b6777fc5959d035fbbc17a26e3e8fc8ab519eb7d67f7f97ac07ecb4a97d92480050435a20f89987de86e18d8391339c3b92c796ae7d0f7a75f8d57b2392539cc3c39e5ffe6206080012001a006a4033e40bfeaae5e6733712b2ed692cc9a9b35cf5ec8c15432347d9caf6a2cc9a334bf490fc6e817e2b9082bf9d7ddd74ecc1f5c4b50a973a05183e2c3bee2eff0e1a16080f12120a10a21eee43f81c4bc447ee6f43cf2b0f5f';

module.exports = {
	block,
	blockWithTransaction,
	encodedBlock,
	encodedBlockWithTransaction,
};
