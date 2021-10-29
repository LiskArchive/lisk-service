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
const transactionsSchema = {
	jsonrpc: '2.0',
	result: {
		data: [
			{
				moduleAssetId: '2:0',
				moduleAssetName: 'token:transfer',
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
							minLength: 20,
							maxLength: 20,
						},
						data: {
							dataType: 'string',
							fieldNumber: 3,
							minLength: 0,
							maxLength: 64,
						},
					},
				},
			},
			{
				moduleAssetId: '4:0',
				moduleAssetName: 'keys:registerMultisignatureGroup',
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
				moduleAssetId: '5:0',
				moduleAssetName: 'dpos:registerDelegate',
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
				moduleAssetId: '5:1',
				moduleAssetName: 'dpos:voteDelegate',
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
				moduleAssetId: '5:2',
				moduleAssetName: 'dpos:unlockToken',
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
				moduleAssetId: '5:3',
				moduleAssetName: 'dpos:reportDelegateMisbehavior',
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
				moduleAssetId: '1000:0',
				moduleAssetName: 'legacyAccount:reclaimLSK',
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
		meta: {
			count: 7,
			offset: 0,
			total: 7,
		},
	},
	id: 1,
};

module.exports = {
	transactionsSchema,
};
