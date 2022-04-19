/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const transactionType8 = {
	data: [
		{
			id: '81259126789646120000',
			type: 8,
			fee: '130130',
			senderPublicKey: '4ce1395874115c515beb71ff68aae6c1c0b86e6028b7619a11afe7efd0a4c6c2',
			nonce: '128',
			asset: {
				amount: '7',
				recipientId: '3862582774794822700L',
			},
			signatures: [
				'0f8092c5ad21ea229f5c2f08f9da2e5455d069985eed0f0354b94d065a84e3ba52bff72203d69987ca9e32be71d258286338852b2b70297e880856bf2181d7cc',
			],
			height: 30428,
			blockId: 894345162569656300,
			senderId: '8578631653980067000L',
			recipientPublicKey: '2d1d447e9aaa6e92f24436ec54b7b1f53c61f58dd3b3476379540b42891f1ec4',
			confirmations: 2,
		},
	],
};

const transactionType10 = {
	data: [
		{
			id: '51035645237054640000',
			type: 10,
			fee: '1000120120',
			senderPublicKey: 'a54c99590d3a193071ba9c5ec9df545ec837d20114bc900aa1fd092cafefe9a3',
			nonce: '801',
			asset: {
				username: 'Alisa',
				publicKey: 'a54c99590d3a193071ba9c5ec9df545ec837d20114bc900aa1fd092cafefe9a3',
				address: '2756654276587256000L',
			},
			signatures: [
				'd727cf3848dce0c64c47c7776fc5e48a088e617bd57aa2fa1333cf45b17ba0a24cbda607fc9530ea74e1df2e157698db0a7095b745813205ec827f9c013710cf',
			],
			height: 50286,
			blockId: 9365366260888246000,
			senderId: '2756654276587256000L',
			recipientPublicKey: 'b9ab26b10b7a8ca5dda1a9afe671ca89c7223dfe299ef53bfb62f77ea34039b0',
			confirmations: 0,
		},
	],
};

const transactionType12 = {
	data: [
		{
			id: '36561956333344494000',
			type: 12,
			fee: '117117',
			senderPublicKey: '59ef021bb06c68eea67071dfd2f3e4544ea54fef4d1fa51f5ae4b2fd7591ab5e',
			nonce: '199',
			asset: {
				mandatoryKeys: [
					'+715a71ca3ba2dab2e93d32cdfadfccdf0b09320de95000fc5f01e00b44c4427c',
					'c078fc0bc13bbd0c30bc9e6ddb0f5284fbb3231208f4c36ed2a73c9b9072c83a10f494c1e723131a13973ad28a905f07adfe273fa42328b7c083f7ae25e9a2eb',
				],
				optionalKeys: [
					'+cb295e8a3595141e7af068d54a6a909e6c0208a9cdf9d358f7fd0dbdb1d2f737',
					'a94adfbf7fa81e402626dc723e82a92f89884f17077500b5dfc5f98e4d1e9a255e1216438550ac6e8cfeb9ec33a717bc70a1a708c5c8673b5681bedf8f1a930d',
					'7c3cc4ec3961b915d95308fa21b90abc91a1b55be23071fa88c6b0411faee07d1be25f67b0873b380a82a4d1836c17d66d9bc334f169f870082db859aac59b72',
					'8fb2c75dc23b421694817e4f9dfcbec40676ca4e82fd979ba0ea2b5a1838b1343bde13de933fd82d107adb2c4762c056e2803ebca959c2069468ead2afc23f86',
				],
				numberOfSignatures: 2,
			},
			signatures: [
				'e5870501d7afe0d70fe39f4b71304cb0b94add4fe948c7ef3fd3293a5d18a25bceca099f2ab74ce917e61b532f6ad7d49de1c810da48fdd69b1a4b2f78163096',
			],
			height: 63362,
			blockId: 5982010003191737000,
			senderId: '5088118003720889000L',
			recipientPublicKey: '12cca9d7554ce6d983f64a04f458cecb97c894c1f4cc5a28d684d5e3e564f5fd',
			confirmations: 4,
		},
	],
};

const transactionType13 = {
	data: [
		{
			id: '17587273127295599000',
			type: 13,
			fee: '155350',
			senderPublicKey: '85299d8eafec707c2d7b042f76e2c4084304b393af4b3c2174bcfe0c3c7ed4f0',
			nonce: '966',
			asset: {
				votes: [
					{
						amount: '70000000',
						delegateAddress: '4912807329349817000L',
					},
				],
			},
			signatures: [
				'77d6a6df4119b30f84e4e389c763946c87d76e0db758d50d64806cf35ae1c897b1297504b24cfe464d79afa11bbfcc894a838242a55acf76226eeba4d5b40672',
			],
			height: 30428,
			blockId: 894345162569656300,
			senderId: '8168395221274813000L',
			recipientPublicKey: '8c583c1f1f37dd2a0d3c78a0b5586a69784797f8364fa4d46c8f5e7d6044df6d',
			confirmations: 2,
		},
	],
};

const transactionType14 = {
	data: [
		{
			id: '5434093664429485000',
			type: 14,
			fee: '136144',
			senderPublicKey: '7913eccbcc2e2c83f49b53f5c5c8ec7673c52ae8275773f75af1799e7c8ab0ec',
			nonce: '20',
			asset: {
				unlockingObjects: [
					{
						delegateAddress: '9363148476954085000L',
						amount: '10000000',
						unvoteHeight: 5,
					},
				],
			},
			signatures: [
				'4bd91850a60775a46f6a0c927c8571c5380454ef3cb56503c1eb0e03cad048c9a24a8d5ff04a9188ff248de2ea7a67245eeecea1aa67f3f72e080ebeca147dd5',
			],
			height: 30428,
			blockId: 894345162569656300,
			senderId: '2480778356616291300L',
			recipientPublicKey: '5763320ca347f2d61ffffc0cad34c102d1127548df72f3b69bd4cbf420963aa7',
			confirmations: 2,
		},
	],
};

const transactionType15 = {
	data: [
		{
			id: '38374362280021270000',
			type: 15,
			fee: '794788',
			senderPublicKey: '5d4807d95255afbad07393639f05640591127299ca00d654957603e627e4c0b9',
			nonce: '437',
			asset: {
				header1: {
					blockSignature: 'f77120f3a27c5e01879b75afc8f2af77adcbce06150de473789360aaeedcc68b94b8481e1aebb67ddc4456acc0d94b253366440969a9a3e726377fa5e0531a7c',
					generatorPublicKey: '5adabf02fa058f222ec24360c75656643050e0f4c89e0b6d129e9afecc08c8fe',
					height: 72471,
					maxHeightPreviouslyForged: 93237,
					maxHeightPrevoted: 34793,
					numberOfTransactions: 6,
					payloadHash: 'ed92d0d31c440b7f370ea23b351ed012b91b2559d8502075951c22be9c132642',
					payloadLength: 434,
					previousBlockId: 154512998319638050,
					reward: '100000000',
					seedReveal: '2bc4ab164e9cfa6ce439de78d9df0689',
					timestamp: 3728036533,
					totalAmount: 53116590,
					totalFee: 57297944,
					version: 1,
				},
				header2: {
					blockSignature: '132db8cb74cb0a18e26e67c5c2018d0fccc0efd9d69bbd759a1084c98a4b8bd24dcaaee125479a755ce8f17a39c90f3ed070340b137dce69999850b0cbbf23a9',
					generatorPublicKey: '5adabf02fa058f222ec24360c75656643050e0f4c89e0b6d129e9afecc08c8fe',
					height: 50403,
					maxHeightPreviouslyForged: 68439,
					maxHeightPrevoted: 48137,
					numberOfTransactions: 95,
					payloadHash: '5ec9cdb6338b190f2ed1c1c110241f5a8a207f29a2e24f21afb35305fd3ebb8f',
					payloadLength: 260,
					previousBlockId: 1962031306049756200,
					reward: '100000000',
					seedReveal: '2bc4ab164e9cfa6ce439de78d9df0689',
					timestamp: 3728036533,
					totalAmount: 73245003,
					totalFee: 9898545,
					version: 1,
				},
			},
			signatures: [
				'dce2788ab1bdaca5d46ecd1c6fb7d3bd70b90f874640218c88b9c0e77ac3e1a3eba538b3f0b81b4c876329eb88ff9f42e4f55d9264648948899299c372c00b0a',
				'1717339d1681e3c158bef38c3954202f3333cbb90cfa13293e5c80371da962f2c7641d841e71e02fb9d8ca5471a54b2cb008a86987411b6372cd300a61eadd1c',
				'fa1ff18137db9a4099eeb15a5bc75bcf9b59477876073b5738feaae21f33365b7c225b6fa673c46f7db1b531909d564962406a3ba3a9c6ee5a1704f28c91f11e',
			],
			height: 50286,
			blockId: 9365366260888246000,
			senderId: '6947743686875216000L',
			recipientPublicKey: '6fbfcc0f136b87b241236dc698042361da70ed8af1c75ee33ca58160d08018b9',
			confirmations: 0,
			ready: true,
		},
	],
};

module.exports = {
	transactionType8,
	transactionType10,
	transactionType12,
	transactionType13,
	transactionType14,
	transactionType15,
};
