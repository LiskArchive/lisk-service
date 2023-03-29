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
const liskAccount = Object.freeze({
	input: {
		address: '7a74ddeca43fef9d3fbf405039743dc54f0cdc9b',
		token: {
			balance: '124128823283',
		},
		sequence: {
			nonce: '248',
		},
		keys: {
			numberOfSignatures: 2,
			mandatoryKeys: [
				'14d554573013e49a6bf8b6041677426067b84633de624ed1db9d9ee5214a5379',
				'90ad9bfed339af2d6b4b3b7f7cdf25d927b255f9f25dbbc892ee9ca57ef67807',
			],
			optionalKeys: [],
		},
		dpos: {
			delegate: {
				username: 'mrv',
				pomHeights: [],
				consecutiveMissedBlocks: 0,
				lastForgedHeight: 18211807,
				isBanned: false,
				totalVotesReceived: '20171000000000',
			},
			sentVotes: [
				{
					delegateAddress: '7a74ddeca43fef9d3fbf405039743dc54f0cdc9b',
					amount: '2051000000000',
				},
			],
			unlocking: [],
		},
	},
	expected: {
		address: Buffer.from('7a74ddeca43fef9d3fbf405039743dc54f0cdc9b', 'hex'),
		token: {
			balance: BigInt('124128823283'),
		},
		sequence: {
			nonce: BigInt('248'),
		},
		keys: {
			numberOfSignatures: 2,
			mandatoryKeys: [
				Buffer.from('14d554573013e49a6bf8b6041677426067b84633de624ed1db9d9ee5214a5379', 'hex'),
				Buffer.from('90ad9bfed339af2d6b4b3b7f7cdf25d927b255f9f25dbbc892ee9ca57ef67807', 'hex'),
			],
			optionalKeys: [],
		},
		dpos: {
			delegate: {
				username: 'mrv',
				pomHeights: [],
				consecutiveMissedBlocks: 0,
				lastForgedHeight: 18211807,
				isBanned: false,
				totalVotesReceived: BigInt('20171000000000'),
			},
			sentVotes: [
				{
					delegateAddress: Buffer.from('7a74ddeca43fef9d3fbf405039743dc54f0cdc9b', 'hex'),
					amount: BigInt('2051000000000'),
				},
			],
			unlocking: [],
		},
	},
	schema: {
		$id: '/account/base',
		type: 'object',
		properties: {
			address: {
				dataType: 'bytes',
				fieldNumber: 1,
			},
			token: {
				type: 'object',
				properties: {
					balance: {
						fieldNumber: 1,
						dataType: 'uint64',
					},
				},
				fieldNumber: 2,
			},
			sequence: {
				type: 'object',
				properties: {
					nonce: {
						fieldNumber: 1,
						dataType: 'uint64',
					},
				},
				fieldNumber: 3,
			},
			keys: {
				type: 'object',
				properties: {
					numberOfSignatures: {
						dataType: 'uint32',
						fieldNumber: 1,
					},
					mandatoryKeys: {
						type: 'array',
						items: {
							dataType: 'bytes',
						},
						fieldNumber: 2,
					},
					optionalKeys: {
						type: 'array',
						items: {
							dataType: 'bytes',
						},
						fieldNumber: 3,
					},
				},
				fieldNumber: 4,
			},
			dpos: {
				type: 'object',
				properties: {
					delegate: {
						type: 'object',
						fieldNumber: 1,
						properties: {
							username: {
								dataType: 'string',
								fieldNumber: 1,
							},
							pomHeights: {
								type: 'array',
								items: {
									dataType: 'uint32',
								},
								fieldNumber: 2,
							},
							consecutiveMissedBlocks: {
								dataType: 'uint32',
								fieldNumber: 3,
							},
							lastForgedHeight: {
								dataType: 'uint32',
								fieldNumber: 4,
							},
							isBanned: {
								dataType: 'boolean',
								fieldNumber: 5,
							},
							totalVotesReceived: {
								dataType: 'uint64',
								fieldNumber: 6,
							},
						},
						required: [
							'username',
							'pomHeights',
							'consecutiveMissedBlocks',
							'lastForgedHeight',
							'isBanned',
							'totalVotesReceived',
						],
					},
					sentVotes: {
						type: 'array',
						fieldNumber: 2,
						items: {
							type: 'object',
							properties: {
								delegateAddress: {
									dataType: 'bytes',
									fieldNumber: 1,
								},
								amount: {
									dataType: 'uint64',
									fieldNumber: 2,
								},
							},
							required: [
								'delegateAddress',
								'amount',
							],
						},
					},
					unlocking: {
						type: 'array',
						fieldNumber: 3,
						items: {
							type: 'object',
							properties: {
								delegateAddress: {
									dataType: 'bytes',
									fieldNumber: 1,
								},
								amount: {
									dataType: 'uint64',
									fieldNumber: 2,
								},
								unvoteHeight: {
									dataType: 'uint32',
									fieldNumber: 3,
								},
							},
							required: [
								'delegateAddress',
								'amount',
								'unvoteHeight',
							],
						},
					},
				},
				fieldNumber: 5,
			},
		},
		required: [
			'address',
			'token',
			'sequence',
			'keys',
			'dpos',
		],
	},
});

const liskBlock = Object.freeze({
	input: {
		header: {
			version: 2,
			timestamp: 1649419370,
			height: 18211765,
			previousBlockID: '82919375aeffdd90f32465cab6df95bdbc0c87698f17a539baad1b8575db4437',
			transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			generatorPublicKey: '6cb825715058d2e821aa4af75fbd0da52181910d9fda90fabe73cd533eeb6acb',
			reward: '100000000',
			asset: {
				maxHeightPreviouslyForged: 18211671,
				maxHeightPrevoted: 18211676,
				seedReveal: 'bbe7d7e3afb79ff40551b3535c1fbd6b',
			},
			signature: 'b82ef12b707669d86b970e73df7a39c3ad9e7a89725b683da67e7e3e2cefbef9645e2791e0f0134edcb07ad51ea46645bfe7666d8a672cd02d518d2c88a3850c',
			id: 'b179c1f9551f292938fe33f66e910cd78820a78a156efc5e0e14b19a53ef1363',
		},
		payload: [],
	},
	expected: {
		header: {
			version: 2,
			timestamp: 1649419370,
			height: 18211765,
			previousBlockID: '82919375aeffdd90f32465cab6df95bdbc0c87698f17a539baad1b8575db4437',
			transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			generatorPublicKey: '6cb825715058d2e821aa4af75fbd0da52181910d9fda90fabe73cd533eeb6acb',
			reward: '100000000',
			asset: {
				maxHeightPreviouslyForged: 18211671,
				maxHeightPrevoted: 18211676,
				seedReveal: 'bbe7d7e3afb79ff40551b3535c1fbd6b',
			},
			signature: 'b82ef12b707669d86b970e73df7a39c3ad9e7a89725b683da67e7e3e2cefbef9645e2791e0f0134edcb07ad51ea46645bfe7666d8a672cd02d518d2c88a3850c',
			id: 'b179c1f9551f292938fe33f66e910cd78820a78a156efc5e0e14b19a53ef1363',
		},
		payload: [],
	},
	schema: {
		$id: '/block',
		type: 'object',
		properties: {
			header: {
				dataType: 'bytes',
				fieldNumber: 1,
			},
			payload: {
				type: 'array',
				items: {
					dataType: 'bytes',
				},
				fieldNumber: 2,
			},
		},
		required: [
			'header',
			'payload',
		],
	},
});

const liskBlockHeader = Object.freeze({
	input: {
		version: 2,
		timestamp: 1649419370,
		height: 18211765,
		previousBlockID: '82919375aeffdd90f32465cab6df95bdbc0c87698f17a539baad1b8575db4437',
		transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		generatorPublicKey: '6cb825715058d2e821aa4af75fbd0da52181910d9fda90fabe73cd533eeb6acb',
		reward: '100000000',
		asset: {
			maxHeightPreviouslyForged: 18211671,
			maxHeightPrevoted: 18211676,
			seedReveal: 'bbe7d7e3afb79ff40551b3535c1fbd6b',
		},
		signature: 'b82ef12b707669d86b970e73df7a39c3ad9e7a89725b683da67e7e3e2cefbef9645e2791e0f0134edcb07ad51ea46645bfe7666d8a672cd02d518d2c88a3850c',
		id: 'b179c1f9551f292938fe33f66e910cd78820a78a156efc5e0e14b19a53ef1363',
	},
	expected: {
		version: 2,
		timestamp: 1649419370,
		height: 18211765,
		previousBlockID: Buffer.from('82919375aeffdd90f32465cab6df95bdbc0c87698f17a539baad1b8575db4437', 'hex'),
		transactionRoot: Buffer.from('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'hex'),
		generatorPublicKey: Buffer.from('6cb825715058d2e821aa4af75fbd0da52181910d9fda90fabe73cd533eeb6acb', 'hex'),
		reward: BigInt('100000000'),
		asset: {
			maxHeightPreviouslyForged: 18211671,
			maxHeightPrevoted: 18211676,
			seedReveal: 'bbe7d7e3afb79ff40551b3535c1fbd6b',
		},
		signature: Buffer.from('b82ef12b707669d86b970e73df7a39c3ad9e7a89725b683da67e7e3e2cefbef9645e2791e0f0134edcb07ad51ea46645bfe7666d8a672cd02d518d2c88a3850c', 'hex'),
		id: 'b179c1f9551f292938fe33f66e910cd78820a78a156efc5e0e14b19a53ef1363',
	},
	schema: {
		$id: '/block/header',
		type: 'object',
		properties: {
			version: {
				dataType: 'uint32',
				fieldNumber: 1,
			},
			timestamp: {
				dataType: 'uint32',
				fieldNumber: 2,
			},
			height: {
				dataType: 'uint32',
				fieldNumber: 3,
			},
			previousBlockID: {
				dataType: 'bytes',
				fieldNumber: 4,
			},
			transactionRoot: {
				dataType: 'bytes',
				fieldNumber: 5,
			},
			generatorPublicKey: {
				dataType: 'bytes',
				fieldNumber: 6,
			},
			reward: {
				dataType: 'uint64',
				fieldNumber: 7,
			},
			asset: {
				dataType: 'bytes',
				fieldNumber: 8,
			},
			signature: {
				dataType: 'bytes',
				fieldNumber: 9,
			},
		},
		required: [
			'version',
			'timestamp',
			'height',
			'previousBlockID',
			'transactionRoot',
			'generatorPublicKey',
			'reward',
			'asset',
		],
	},
});

const liskBlockHeaderAsset = Object.freeze({
	input: {
		initRounds: 3,
		initDelegates: [
			'03f6d90b7dbd0497dc3a52d1c27e23bb8c75897f',
			'0903f4c5cb599a7928aef27e314e98291d1e3888',
			'0ada6a2f6c8f891769366fc9aa6fd9f1facb36cf',
			'0bc3bec2fdb565996fd316e368e66e5d8e830808',
			'0d2c377e936b68c70066613b10c0fdad537f90da',
		],
		accounts: [
			{
				address: '0208930cab3923a1',
				token: {
					balance: '6800000000',
				},
				sequence: {
					nonce: '0',
				},
				keys: {
					mandatoryKeys: [],
					optionalKeys: [],
					numberOfSignatures: 0,
				},
				dpos: {
					delegate: {
						username: '',
						pomHeights: [],
						consecutiveMissedBlocks: 0,
						lastForgedHeight: 250,
						isBanned: false,
						totalVotesReceived: '0',
					},
					sentVotes: [],
					unlocking: [],
				},
			},
			{
				address: '03f6d90b7dbd0497dc3a52d1c27e23bb8c75897f',
				token: {
					balance: '0',
				},
				sequence: {
					nonce: '0',
				},
				keys: {
					mandatoryKeys: [],
					optionalKeys: [],
					numberOfSignatures: 0,
				},
				dpos: {
					delegate: {
						username: 'genesis_34',
						pomHeights: [],
						consecutiveMissedBlocks: 0,
						lastForgedHeight: 250,
						isBanned: false,
						totalVotesReceived: '1000000000000',
					},
					sentVotes: [
						{
							delegateAddress: '03f6d90b7dbd0497dc3a52d1c27e23bb8c75897f',
							amount: '1000000000000',
						},
					],
					unlocking: [],
				},
			},
		],
	},
	expected: {
		initRounds: 3,
		initDelegates: [
			Buffer.from('03f6d90b7dbd0497dc3a52d1c27e23bb8c75897f', 'hex'),
			Buffer.from('0903f4c5cb599a7928aef27e314e98291d1e3888', 'hex'),
			Buffer.from('0ada6a2f6c8f891769366fc9aa6fd9f1facb36cf', 'hex'),
			Buffer.from('0bc3bec2fdb565996fd316e368e66e5d8e830808', 'hex'),
			Buffer.from('0d2c377e936b68c70066613b10c0fdad537f90da', 'hex'),
		],
		accounts: [
			{
				address: Buffer.from('0208930cab3923a1', 'hex'),
				token: {
					balance: BigInt('6800000000'),
				},
				sequence: {
					nonce: BigInt('0'),
				},
				keys: {
					mandatoryKeys: [],
					optionalKeys: [],
					numberOfSignatures: 0,
				},
				dpos: {
					delegate: {
						username: '',
						pomHeights: [],
						consecutiveMissedBlocks: 0,
						lastForgedHeight: 250,
						isBanned: false,
						totalVotesReceived: BigInt('0'),
					},
					sentVotes: [],
					unlocking: [],
				},
			},
			{
				address: Buffer.from('03f6d90b7dbd0497dc3a52d1c27e23bb8c75897f', 'hex'),
				token: {
					balance: BigInt('0'),
				},
				sequence: {
					nonce: BigInt('0'),
				},
				keys: {
					mandatoryKeys: [],
					optionalKeys: [],
					numberOfSignatures: 0,
				},
				dpos: {
					delegate: {
						username: 'genesis_34',
						pomHeights: [],
						consecutiveMissedBlocks: 0,
						lastForgedHeight: 250,
						isBanned: false,
						totalVotesReceived: BigInt('1000000000000'),
					},
					sentVotes: [
						{
							delegateAddress: Buffer.from('03f6d90b7dbd0497dc3a52d1c27e23bb8c75897f', 'hex'),
							amount: BigInt('1000000000000'),
						},
					],
					unlocking: [],
				},
			},
		],
	},
	schema: {
		$id: '/genesisBlock/header/asset',
		type: 'object',
		required: [
			'accounts',
			'initDelegates',
			'initRounds',
		],
		properties: {
			accounts: {
				type: 'array',
				fieldNumber: 1,
				items: {
					$id: '/account/base',
					type: 'object',
					properties: {
						address: {
							dataType: 'bytes',
							fieldNumber: 1,
						},
						token: {
							type: 'object',
							properties: {
								balance: {
									fieldNumber: 1,
									dataType: 'uint64',
								},
							},
							fieldNumber: 2,
						},
						sequence: {
							type: 'object',
							properties: {
								nonce: {
									fieldNumber: 1,
									dataType: 'uint64',
								},
							},
							fieldNumber: 3,
						},
						keys: {
							type: 'object',
							properties: {
								numberOfSignatures: {
									dataType: 'uint32',
									fieldNumber: 1,
								},
								mandatoryKeys: {
									type: 'array',
									items: {
										dataType: 'bytes',
									},
									fieldNumber: 2,
								},
								optionalKeys: {
									type: 'array',
									items: {
										dataType: 'bytes',
									},
									fieldNumber: 3,
								},
							},
							fieldNumber: 4,
						},
						dpos: {
							type: 'object',
							properties: {
								delegate: {
									type: 'object',
									fieldNumber: 1,
									properties: {
										username: {
											dataType: 'string',
											fieldNumber: 1,
										},
										pomHeights: {
											type: 'array',
											items: {
												dataType: 'uint32',
											},
											fieldNumber: 2,
										},
										consecutiveMissedBlocks: {
											dataType: 'uint32',
											fieldNumber: 3,
										},
										lastForgedHeight: {
											dataType: 'uint32',
											fieldNumber: 4,
										},
										isBanned: {
											dataType: 'boolean',
											fieldNumber: 5,
										},
										totalVotesReceived: {
											dataType: 'uint64',
											fieldNumber: 6,
										},
									},
									required: [
										'username',
										'pomHeights',
										'consecutiveMissedBlocks',
										'lastForgedHeight',
										'isBanned',
										'totalVotesReceived',
									],
								},
								sentVotes: {
									type: 'array',
									fieldNumber: 2,
									items: {
										type: 'object',
										properties: {
											delegateAddress: {
												dataType: 'bytes',
												fieldNumber: 1,
											},
											amount: {
												dataType: 'uint64',
												fieldNumber: 2,
											},
										},
										required: [
											'delegateAddress',
											'amount',
										],
									},
								},
								unlocking: {
									type: 'array',
									fieldNumber: 3,
									items: {
										type: 'object',
										properties: {
											delegateAddress: {
												dataType: 'bytes',
												fieldNumber: 1,
											},
											amount: {
												dataType: 'uint64',
												fieldNumber: 2,
											},
											unvoteHeight: {
												dataType: 'uint32',
												fieldNumber: 3,
											},
										},
										required: [
											'delegateAddress',
											'amount',
											'unvoteHeight',
										],
									},
								},
							},
							fieldNumber: 5,
						},
					},
					required: [
						'address',
						'token',
						'sequence',
						'keys',
						'dpos',
					],
				},
			},
			initDelegates: {
				type: 'array',
				items: {
					dataType: 'bytes',
				},
				fieldNumber: 2,
				minItems: 1,
			},
			initRounds: {
				dataType: 'uint32',
				fieldNumber: 3,
				minimum: 3,
			},
		},
	},
});

const liskBlockHeaderAssetV3 = Object.freeze({
	input: {
		maxHeightPreviouslyForged: 18211671,
		maxHeightPrevoted: 18211676,
		seedReveal: 'bbe7d7e3afb79ff40551b3535c1fbd6b',
	},
	expected: {
		maxHeightPreviouslyForged: 18211671,
		maxHeightPrevoted: 18211676,
		seedReveal: Buffer.from('bbe7d7e3afb79ff40551b3535c1fbd6b', 'hex'),
	},
	schema: {
		$id: '/blockHeader/asset/v3',
		type: 'object',
		properties: {
			maxHeightPreviouslyForged: {
				dataType: 'uint32',
				fieldNumber: 1,
			},
			maxHeightPrevoted: {
				dataType: 'uint32',
				fieldNumber: 2,
			},
			seedReveal: {
				dataType: 'bytes',
				minLength: 16,
				maxLength: 16,
				fieldNumber: 3,
			},
		},
		required: [
			'maxHeightPreviouslyForged',
			'maxHeightPrevoted',
			'seedReveal',
		],
	},
});

const liskTransaction = Object.freeze({
	input: {
		moduleID: 2,
		assetID: 0,
		nonce: '4',
		fee: '1000000',
		senderPublicKey: '5133af7944acf5278b0310a11c06134f80ab4546d77d1b0e027c8430a7d2bb92',
		signatures: [
			'98a9ee2cde8354d014cfe6367d430be2713e102f37d92ab91f03db780407e5bf6d818a45c21c9f5518638dfc3c5365fc2d497b928e0b9d6337988df46a663a02',
		],
		asset: {
			amount: '800000000',
			recipientAddress: '9bd82e637d306533b1e1ad66e19ca0047faa1a6a',
			data: 'Happy birthday!',
		},
		id: '17a0904415f7ad9a0e305ae8a43453243a84e2afe176083a0ab33fb12e3bbc25',
	},
	expected: {
		moduleID: 2,
		assetID: 0,
		nonce: BigInt('4'),
		fee: BigInt('1000000'),
		senderPublicKey: Buffer.from('5133af7944acf5278b0310a11c06134f80ab4546d77d1b0e027c8430a7d2bb92', 'hex'),
		signatures: [
			Buffer.from('98a9ee2cde8354d014cfe6367d430be2713e102f37d92ab91f03db780407e5bf6d818a45c21c9f5518638dfc3c5365fc2d497b928e0b9d6337988df46a663a02', 'hex'),
		],
		asset: {
			amount: '800000000',
			recipientAddress: '9bd82e637d306533b1e1ad66e19ca0047faa1a6a',
			data: 'Happy birthday!',
		},
		id: '17a0904415f7ad9a0e305ae8a43453243a84e2afe176083a0ab33fb12e3bbc25',
	},
	schema: {
		$id: 'lisk/transaction',
		type: 'object',
		required: [
			'moduleID',
			'assetID',
			'nonce',
			'fee',
			'senderPublicKey',
			'asset',
		],
		properties: {
			moduleID: {
				dataType: 'uint32',
				fieldNumber: 1,
				minimum: 2,
			},
			assetID: {
				dataType: 'uint32',
				fieldNumber: 2,
			},
			nonce: {
				dataType: 'uint64',
				fieldNumber: 3,
			},
			fee: {
				dataType: 'uint64',
				fieldNumber: 4,
			},
			senderPublicKey: {
				dataType: 'bytes',
				fieldNumber: 5,
				minLength: 32,
				maxLength: 32,
			},
			asset: {
				dataType: 'bytes',
				fieldNumber: 6,
			},
			signatures: {
				type: 'array',
				items: {
					dataType: 'bytes',
				},
				fieldNumber: 7,
			},
		},
	},
});

const liskTransactionAssets = Object.freeze([
	{
		moduleID: 2,
		moduleName: 'token',
		assetID: 0,
		assetName: 'transfer',
		input: {
			amount: '800000000',
			recipientAddress: '9bd82e637d306533b1e1ad66e19ca0047faa1a6a',
			data: 'Happy birthday!',
		},
		expected: {
			amount: BigInt('800000000'),
			recipientAddress: Buffer.from('9bd82e637d306533b1e1ad66e19ca0047faa1a6a', 'hex'),
			data: 'Happy birthday!',
		},
		schema: {
			$id: 'lisk/transfer-asset',
			title: 'Transfer transaction asset',
			type: 'object',
			required: [
				'amount',
				'recipientAddress',
				'data',
			],
			properties: {
				amount: {
					dataType: 'uint64',
					fieldNumber: 1,
				},
				recipientAddress: {
					dataType: 'bytes',
					fieldNumber: 2,
				},
				data: {
					dataType: 'string',
					fieldNumber: 3,
				},
			},
		},
	},
	{
		moduleID: 4,
		moduleName: 'keys',
		assetID: 0,
		assetName: 'registerMultisignatureGroup',
		input: {
			numberOfSignatures: 2,
			mandatoryKeys: [
				'99383a3b758b50b47e9e1050021145ac887a2798fe0b6517651b94fcae531c37',
				'9d07456853566c56537655068683eb9e5f9d8ba45066031f16d9690c32ea9576',
			],
			optionalKeys: [],
		},
		expected: {
			numberOfSignatures: 2,
			mandatoryKeys: [
				Buffer.from('99383a3b758b50b47e9e1050021145ac887a2798fe0b6517651b94fcae531c37', 'hex'),
				Buffer.from('9d07456853566c56537655068683eb9e5f9d8ba45066031f16d9690c32ea9576', 'hex'),
			],
			optionalKeys: [],
		},
		schema: {
			$id: 'lisk/keys/register',
			type: 'object',
			required: [
				'numberOfSignatures',
				'optionalKeys',
				'mandatoryKeys',
			],
			properties: {
				numberOfSignatures: {
					dataType: 'uint32',
					fieldNumber: 1,
					minimum: 1,
					maximum: 64,
				},
				mandatoryKeys: {
					type: 'array',
					items: {
						dataType: 'bytes',
						minLength: 32,
						maxLength: 32,
					},
					fieldNumber: 2,
					minItems: 0,
					maxItems: 64,
				},
				optionalKeys: {
					type: 'array',
					items: {
						dataType: 'bytes',
						minLength: 32,
						maxLength: 32,
					},
					fieldNumber: 3,
					minItems: 0,
					maxItems: 64,
				},
			},
		},
	},
	{
		moduleID: 5,
		moduleName: 'dpos',
		assetID: 0,
		assetName: 'registerDelegate',
		input: {
			username: 'compa16',
		},
		expected: {
			username: 'compa16',
		},
		schema: {
			$id: 'lisk/dpos/register',
			type: 'object',
			required: [
				'username',
			],
			properties: {
				username: {
					dataType: 'string',
					fieldNumber: 1,
					minLength: 1,
					maxLength: 20,
				},
			},
		},
	},
	{
		moduleID: 5,
		moduleName: 'dpos',
		assetID: 1,
		assetName: 'voteDelegate',
		input: {
			votes: [
				{
					delegateAddress: '0dcbf1e5501dd01b98eccd2b482d8ce08fcdf616',
					amount: '241000000000',
				},
				{
					delegateAddress: 'c67af61e69a056bed931e7dd253d89171f4de43a',
					amount: '74000000000',
				},
				{
					delegateAddress: '7a74ddeca43fef9d3fbf405039743dc54f0cdc9b',
					amount: '7000000000',
				},
				{
					delegateAddress: '422e7cddcde0825d91fa017188945080a5cc9fca',
					amount: '28000000000',
				},
			],
		},
		expected: {
			votes: [
				{
					delegateAddress: Buffer.from('0dcbf1e5501dd01b98eccd2b482d8ce08fcdf616', 'hex'),
					amount: BigInt('241000000000'),
				},
				{
					delegateAddress: Buffer.from('c67af61e69a056bed931e7dd253d89171f4de43a', 'hex'),
					amount: BigInt('74000000000'),
				},
				{
					delegateAddress: Buffer.from('7a74ddeca43fef9d3fbf405039743dc54f0cdc9b', 'hex'),
					amount: BigInt('7000000000'),
				},
				{
					delegateAddress: Buffer.from('422e7cddcde0825d91fa017188945080a5cc9fca', 'hex'),
					amount: BigInt('28000000000'),
				},
			],
		},
		schema: {
			$id: 'lisk/dpos/vote',
			type: 'object',
			required: [
				'votes',
			],
			properties: {
				votes: {
					type: 'array',
					minItems: 1,
					maxItems: 20,
					items: {
						type: 'object',
						required: [
							'delegateAddress',
							'amount',
						],
						properties: {
							delegateAddress: {
								dataType: 'bytes',
								fieldNumber: 1,
								minLength: 20,
								maxLength: 20,
							},
							amount: {
								dataType: 'sint64',
								fieldNumber: 2,
							},
						},
					},
					fieldNumber: 1,
				},
			},
		},
	},
	{
		moduleID: 5,
		moduleName: 'dpos',
		assetID: 2,
		assetName: 'unlockToken',
		input: {
			unlockObjects: [
				{
					delegateAddress: '37a12683e25e36c123e9483f9b106d95363fde60',
					amount: '1578000000000',
					unvoteHeight: 18205474,
				},
				{
					delegateAddress: '895ce5c3c34da481993b9d343ef5f74e1d85cdca',
					amount: '926000000000',
					unvoteHeight: 18205474,
				},
				{
					delegateAddress: 'aa0b32245400d183d4ccd34fe883a6bdc1e3eef9',
					amount: '1578000000000',
					unvoteHeight: 18205474,
				},
				{
					delegateAddress: 'bd1234756844961cc84f028e3efdf1fabe59f7c0',
					amount: '1578000000000',
					unvoteHeight: 18205474,
				},
			],
		},
		expected: {
			unlockObjects: [
				{
					delegateAddress: Buffer.from('37a12683e25e36c123e9483f9b106d95363fde60', 'hex'),
					amount: BigInt('1578000000000'),
					unvoteHeight: 18205474,
				},
				{
					delegateAddress: Buffer.from('895ce5c3c34da481993b9d343ef5f74e1d85cdca', 'hex'),
					amount: BigInt('926000000000'),
					unvoteHeight: 18205474,
				},
				{
					delegateAddress: Buffer.from('aa0b32245400d183d4ccd34fe883a6bdc1e3eef9', 'hex'),
					amount: BigInt('1578000000000'),
					unvoteHeight: 18205474,
				},
				{
					delegateAddress: Buffer.from('bd1234756844961cc84f028e3efdf1fabe59f7c0', 'hex'),
					amount: BigInt('1578000000000'),
					unvoteHeight: 18205474,
				},
			],
		},
		schema: {
			$id: 'lisk/dpos/unlock',
			type: 'object',
			required: [
				'unlockObjects',
			],
			properties: {
				unlockObjects: {
					type: 'array',
					minItems: 1,
					maxItems: 20,
					items: {
						type: 'object',
						required: [
							'delegateAddress',
							'amount',
							'unvoteHeight',
						],
						properties: {
							delegateAddress: {
								dataType: 'bytes',
								fieldNumber: 1,
								minLength: 20,
								maxLength: 20,
							},
							amount: {
								dataType: 'uint64',
								fieldNumber: 2,
							},
							unvoteHeight: {
								dataType: 'uint32',
								fieldNumber: 3,
							},
						},
					},
					fieldNumber: 1,
				},
			},
		},
	},
	{
		moduleID: 5,
		moduleName: 'dpos',
		assetID: 3,
		assetName: 'reportDelegateMisbehavior',
		input: {
			header1: {
				version: 2,
				timestamp: 1647573700,
				height: 18027287,
				previousBlockID: '0b6b36182d28c6d88ecbc03427e4e9b3623a987873bb3696ffb77bbdf033b888',
				transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
				generatorPublicKey: 'd26f57478f8d30784ba36658873f84d5134da7eee31ada7d29183a4fe9cdafde',
				reward: '100000000',
				asset: {
					maxHeightPreviouslyForged: 0,
					maxHeightPrevoted: 18027210,
					seedReveal: '6187c9991e64617cab4c54aa26e72431',
				},
				signature: 'f2d578a2b3f4d1244ac13b280be66080192943270c9be6b2304b7f2d3adf6c3c87d9faca7971b33aeb42c21fc58e9e26a5beffbad7dccc21ab859b89585b920b',
			},
			header2: {
				version: 2,
				timestamp: 1648724430,
				height: 18142315,
				previousBlockID: '2c2765f67dda9c1e57d6bd3d8ca8da3db8a9354bf579d93e79d88635c0ecc6b6',
				transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
				generatorPublicKey: 'd26f57478f8d30784ba36658873f84d5134da7eee31ada7d29183a4fe9cdafde',
				reward: '100000000',
				asset: {
					maxHeightPreviouslyForged: 0,
					maxHeightPrevoted: 18142247,
					seedReveal: '6187c9991e64617cab4c54aa26e72431',
				},
				signature: '4e01276f227080fdb91565567511744fb45b9aaa791cf277ba2124f751ad9214d81858dc1b6318f61b0002916484a139aebfaa6f60b7da7d792e160fbeee0608',
			},
		},
		expected: {
			header1: {
				version: 2,
				timestamp: 1647573700,
				height: 18027287,
				previousBlockID: Buffer.from('0b6b36182d28c6d88ecbc03427e4e9b3623a987873bb3696ffb77bbdf033b888', 'hex'),
				transactionRoot: Buffer.from('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'hex'),
				generatorPublicKey: Buffer.from('d26f57478f8d30784ba36658873f84d5134da7eee31ada7d29183a4fe9cdafde', 'hex'),
				reward: BigInt('100000000'),
				asset: {
					maxHeightPreviouslyForged: 0,
					maxHeightPrevoted: 18027210,
					seedReveal: Buffer.from('6187c9991e64617cab4c54aa26e72431', 'hex'),
				},
				signature: Buffer.from('f2d578a2b3f4d1244ac13b280be66080192943270c9be6b2304b7f2d3adf6c3c87d9faca7971b33aeb42c21fc58e9e26a5beffbad7dccc21ab859b89585b920b', 'hex'),
			},
			header2: {
				version: 2,
				timestamp: 1648724430,
				height: 18142315,
				previousBlockID: Buffer.from('2c2765f67dda9c1e57d6bd3d8ca8da3db8a9354bf579d93e79d88635c0ecc6b6', 'hex'),
				transactionRoot: Buffer.from('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'hex'),
				generatorPublicKey: Buffer.from('d26f57478f8d30784ba36658873f84d5134da7eee31ada7d29183a4fe9cdafde', 'hex'),
				reward: BigInt('100000000'),
				asset: {
					maxHeightPreviouslyForged: 0,
					maxHeightPrevoted: 18142247,
					seedReveal: Buffer.from('6187c9991e64617cab4c54aa26e72431', 'hex'),
				},
				signature: Buffer.from('4e01276f227080fdb91565567511744fb45b9aaa791cf277ba2124f751ad9214d81858dc1b6318f61b0002916484a139aebfaa6f60b7da7d792e160fbeee0608', 'hex'),
			},
		},
		schema: {
			$id: 'lisk/dpos/pom',
			type: 'object',
			required: [
				'header1',
				'header2',
			],
			properties: {
				header1: {
					$id: 'block-header1',
					type: 'object',
					properties: {
						version: {
							dataType: 'uint32',
							fieldNumber: 1,
						},
						timestamp: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
						height: {
							dataType: 'uint32',
							fieldNumber: 3,
						},
						previousBlockID: {
							dataType: 'bytes',
							fieldNumber: 4,
						},
						transactionRoot: {
							dataType: 'bytes',
							fieldNumber: 5,
						},
						generatorPublicKey: {
							dataType: 'bytes',
							fieldNumber: 6,
						},
						reward: {
							dataType: 'uint64',
							fieldNumber: 7,
						},
						asset: {
							type: 'object',
							fieldNumber: 8,
							properties: {
								maxHeightPreviouslyForged: {
									dataType: 'uint32',
									fieldNumber: 1,
								},
								maxHeightPrevoted: {
									dataType: 'uint32',
									fieldNumber: 2,
								},
								seedReveal: {
									dataType: 'bytes',
									fieldNumber: 3,
								},
							},
							required: [
								'maxHeightPreviouslyForged',
								'maxHeightPrevoted',
								'seedReveal',
							],
						},
						signature: {
							dataType: 'bytes',
							fieldNumber: 9,
						},
					},
					required: [
						'version',
						'timestamp',
						'height',
						'previousBlockID',
						'transactionRoot',
						'generatorPublicKey',
						'reward',
						'asset',
					],
					fieldNumber: 1,
				},
				header2: {
					$id: 'block-header2',
					type: 'object',
					properties: {
						version: {
							dataType: 'uint32',
							fieldNumber: 1,
						},
						timestamp: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
						height: {
							dataType: 'uint32',
							fieldNumber: 3,
						},
						previousBlockID: {
							dataType: 'bytes',
							fieldNumber: 4,
						},
						transactionRoot: {
							dataType: 'bytes',
							fieldNumber: 5,
						},
						generatorPublicKey: {
							dataType: 'bytes',
							fieldNumber: 6,
						},
						reward: {
							dataType: 'uint64',
							fieldNumber: 7,
						},
						asset: {
							type: 'object',
							fieldNumber: 8,
							properties: {
								maxHeightPreviouslyForged: {
									dataType: 'uint32',
									fieldNumber: 1,
								},
								maxHeightPrevoted: {
									dataType: 'uint32',
									fieldNumber: 2,
								},
								seedReveal: {
									dataType: 'bytes',
									fieldNumber: 3,
								},
							},
							required: [
								'maxHeightPreviouslyForged',
								'maxHeightPrevoted',
								'seedReveal',
							],
						},
						signature: {
							dataType: 'bytes',
							fieldNumber: 9,
						},
					},
					required: [
						'version',
						'timestamp',
						'height',
						'previousBlockID',
						'transactionRoot',
						'generatorPublicKey',
						'reward',
						'asset',
					],
					fieldNumber: 2,
				},
			},
		},
	},
	{
		moduleID: 1000,
		moduleName: 'legacyAccount',
		assetID: 0,
		assetName: 'reclaimLSK',
		input: {
			amount: '100155104',
		},
		expected: {
			amount: BigInt('100155104'),
		},
		schema: {
			$id: 'lisk/legacyAccount/reclaim',
			title: 'Reclaim transaction asset',
			type: 'object',
			required: [
				'amount',
			],
			properties: {
				amount: {
					dataType: 'uint64',
					fieldNumber: 1,
				},
			},
		},
	},

]);

module.exports = {
	liskAccount,
	liskBlock,
	liskBlockHeader,
	liskBlockHeaderAsset,
	liskBlockHeaderAssetV3,
	liskTransaction,
	liskTransactionAssets,
};
