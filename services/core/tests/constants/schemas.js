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
const schemas = {
	account: {
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
	block: {
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
	blockHeader: {
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
	blockHeadersAssets: {
		0: {
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
		2: {
			$id: '/blockHeader/asset/v2',
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
	},
	transaction: {
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
	transactionsAssets: [
		{
			moduleID: 2,
			moduleName: 'token',
			assetID: 0,
			assetName: 'transfer',
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
	],
};

module.exports = schemas;
