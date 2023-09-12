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

const schemas = {
	data: {
		assets: [
			{
				module: 'auth',
				version: 0,
				schema: {
					$id: '/auth/module/genesis',
					type: 'object',
					required: [
						'authDataSubstore',
					],
					properties: {
						authDataSubstore: {
							type: 'array',
							fieldNumber: 1,
							items: {
								type: 'object',
								required: [
									'address',
									'authAccount',
								],
								properties: {
									address: {
										dataType: 'bytes',
										fieldNumber: 1,
									},
									authAccount: {
										type: 'object',
										fieldNumber: 2,
										required: [
											'nonce',
											'numberOfSignatures',
											'mandatoryKeys',
											'optionalKeys',
										],
										properties: {
											nonce: {
												dataType: 'uint64',
												fieldNumber: 1,
											},
											numberOfSignatures: {
												dataType: 'uint32',
												fieldNumber: 2,
											},
											mandatoryKeys: {
												type: 'array',
												fieldNumber: 3,
												items: {
													dataType: 'bytes',
													minLength: 32,
													maxLength: 32,
												},
											},
											optionalKeys: {
												type: 'array',
												fieldNumber: 4,
												items: {
													dataType: 'bytes',
													minLength: 32,
													maxLength: 32,
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
			{
				module: 'interoperability',
				version: 0,
				schema: {
					$id: '/interoperability/module/genesis',
					type: 'object',
					required: [
						'ownChainName',
						'ownChainNonce',
						'chainInfos',
						'terminatedStateAccounts',
						'terminatedOutboxAccounts',
					],
					properties: {
						ownChainName: {
							dataType: 'string',
							maxLength: 32,
							fieldNumber: 1,
						},
						ownChainNonce: {
							dataType: 'uint64',
							fieldNumber: 2,
						},
						chainInfos: {
							type: 'array',
							fieldNumber: 3,
							items: {
								type: 'object',
								required: [
									'chainID',
									'chainData',
									'channelData',
									'chainValidators',
								],
								properties: {
									chainID: {
										dataType: 'bytes',
										minLength: 4,
										maxLength: 4,
										fieldNumber: 1,
									},
									chainData: {
										$id: '/modules/interoperability/chainData',
										type: 'object',
										required: [
											'name',
											'lastCertificate',
											'status',
										],
										properties: {
											name: {
												dataType: 'string',
												minLength: 1,
												maxLength: 32,
												fieldNumber: 1,
											},
											lastCertificate: {
												type: 'object',
												fieldNumber: 2,
												required: [
													'height',
													'timestamp',
													'stateRoot',
													'validatorsHash',
												],
												properties: {
													height: {
														dataType: 'uint32',
														fieldNumber: 1,
													},
													timestamp: {
														dataType: 'uint32',
														fieldNumber: 2,
													},
													stateRoot: {
														dataType: 'bytes',
														minLength: 32,
														maxLength: 32,
														fieldNumber: 3,
													},
													validatorsHash: {
														dataType: 'bytes',
														minLength: 32,
														maxLength: 32,
														fieldNumber: 4,
													},
												},
											},
											status: {
												dataType: 'uint32',
												fieldNumber: 3,
											},
										},
										fieldNumber: 2,
									},
									channelData: {
										$id: '/modules/interoperability/channel',
										type: 'object',
										required: [
											'inbox',
											'outbox',
											'partnerChainOutboxRoot',
											'messageFeeTokenID',
											'minReturnFeePerByte',
										],
										properties: {
											inbox: {
												type: 'object',
												fieldNumber: 1,
												required: [
													'appendPath',
													'size',
													'root',
												],
												properties: {
													appendPath: {
														type: 'array',
														items: {
															dataType: 'bytes',
															minLength: 32,
															maxLength: 32,
														},
														fieldNumber: 1,
													},
													size: {
														dataType: 'uint32',
														fieldNumber: 2,
													},
													root: {
														dataType: 'bytes',
														minLength: 32,
														maxLength: 32,
														fieldNumber: 3,
													},
												},
											},
											outbox: {
												type: 'object',
												fieldNumber: 2,
												required: [
													'appendPath',
													'size',
													'root',
												],
												properties: {
													appendPath: {
														type: 'array',
														items: {
															dataType: 'bytes',
															minLength: 32,
															maxLength: 32,
														},
														fieldNumber: 1,
													},
													size: {
														dataType: 'uint32',
														fieldNumber: 2,
													},
													root: {
														dataType: 'bytes',
														minLength: 32,
														maxLength: 32,
														fieldNumber: 3,
													},
												},
											},
											partnerChainOutboxRoot: {
												dataType: 'bytes',
												minLength: 32,
												maxLength: 32,
												fieldNumber: 3,
											},
											messageFeeTokenID: {
												dataType: 'bytes',
												minLength: 8,
												maxLength: 8,
												fieldNumber: 4,
											},
											minReturnFeePerByte: {
												dataType: 'uint64',
												fieldNumber: 5,
											},
										},
										fieldNumber: 3,
									},
									chainValidators: {
										$id: '/modules/interoperability/chainValidators',
										type: 'object',
										required: [
											'activeValidators',
											'certificateThreshold',
										],
										properties: {
											activeValidators: {
												type: 'array',
												fieldNumber: 1,
												minItems: 1,
												maxItems: 199,
												items: {
													type: 'object',
													required: [
														'blsKey',
														'bftWeight',
													],
													properties: {
														blsKey: {
															dataType: 'bytes',
															minLength: 48,
															maxLength: 48,
															fieldNumber: 1,
														},
														bftWeight: {
															dataType: 'uint64',
															fieldNumber: 2,
														},
													},
												},
											},
											certificateThreshold: {
												dataType: 'uint64',
												fieldNumber: 2,
											},
										},
										fieldNumber: 4,
									},
								},
							},
						},
						terminatedStateAccounts: {
							type: 'array',
							fieldNumber: 4,
							items: {
								type: 'object',
								required: [
									'chainID',
									'terminatedStateAccount',
								],
								properties: {
									chainID: {
										dataType: 'bytes',
										minLength: 4,
										maxLength: 4,
										fieldNumber: 1,
									},
									terminatedStateAccount: {
										$id: '/modules/interoperability/terminatedState',
										type: 'object',
										required: [
											'stateRoot',
											'mainchainStateRoot',
											'initialized',
										],
										properties: {
											stateRoot: {
												dataType: 'bytes',
												minLength: 32,
												maxLength: 32,
												fieldNumber: 1,
											},
											mainchainStateRoot: {
												dataType: 'bytes',
												minLength: 32,
												maxLength: 32,
												fieldNumber: 2,
											},
											initialized: {
												dataType: 'boolean',
												fieldNumber: 3,
											},
										},
										fieldNumber: 2,
									},
								},
							},
						},
						terminatedOutboxAccounts: {
							type: 'array',
							fieldNumber: 5,
							items: {
								type: 'object',
								required: [
									'chainID',
									'terminatedOutboxAccount',
								],
								properties: {
									chainID: {
										dataType: 'bytes',
										minLength: 4,
										maxLength: 4,
										fieldNumber: 1,
									},
									terminatedOutboxAccount: {
										$id: '/modules/interoperability/terminatedOutbox',
										type: 'object',
										required: [
											'outboxRoot',
											'outboxSize',
											'partnerChainInboxSize',
										],
										properties: {
											outboxRoot: {
												dataType: 'bytes',
												minLength: 32,
												maxLength: 32,
												fieldNumber: 1,
											},
											outboxSize: {
												dataType: 'uint32',
												fieldNumber: 2,
											},
											partnerChainInboxSize: {
												dataType: 'uint32',
												fieldNumber: 3,
											},
										},
										fieldNumber: 2,
									},
								},
							},
						},
					},
				},
			},
			{
				module: 'legacy',
				version: 0,
				schema: {
					$id: '/legacy/module/genesis',
					type: 'object',
					required: [
						'accounts',
					],
					properties: {
						accounts: {
							type: 'array',
							fieldNumber: 1,
							items: {
								type: 'object',
								required: [
									'address',
									'balance',
								],
								properties: {
									address: {
										dataType: 'bytes',
										minLength: 8,
										maxLength: 8,
										fieldNumber: 1,
									},
									balance: {
										dataType: 'uint64',
										fieldNumber: 2,
									},
								},
							},
						},
					},
				},
			},
			{
				module: 'pos',
				version: 0,
				schema: {
					$id: '/pos/module/genesis',
					type: 'object',
					required: [
						'validators',
						'stakers',
						'genesisData',
					],
					properties: {
						validators: {
							type: 'array',
							fieldNumber: 1,
							items: {
								type: 'object',
								required: [
									'address',
									'name',
									'blsKey',
									'proofOfPossession',
									'generatorKey',
									'lastGeneratedHeight',
									'isBanned',
									'reportMisbehaviorHeights',
									'consecutiveMissedBlocks',
									'commission',
									'lastCommissionIncreaseHeight',
									'sharingCoefficients',
								],
								properties: {
									address: {
										dataType: 'bytes',
										format: 'lisk32',
										fieldNumber: 1,
									},
									name: {
										dataType: 'string',
										fieldNumber: 2,
										minLength: 1,
										maxLength: 20,
									},
									blsKey: {
										dataType: 'bytes',
										fieldNumber: 3,
										minLength: 48,
										maxLength: 48,
									},
									proofOfPossession: {
										dataType: 'bytes',
										fieldNumber: 4,
										minLength: 96,
										maxLength: 96,
									},
									generatorKey: {
										dataType: 'bytes',
										fieldNumber: 5,
										minLength: 32,
										maxLength: 32,
									},
									lastGeneratedHeight: {
										dataType: 'uint32',
										fieldNumber: 6,
									},
									isBanned: {
										dataType: 'boolean',
										fieldNumber: 7,
									},
									reportMisbehaviorHeights: {
										type: 'array',
										fieldNumber: 8,
										items: {
											dataType: 'uint32',
										},
									},
									consecutiveMissedBlocks: {
										dataType: 'uint32',
										fieldNumber: 9,
									},
									commission: {
										dataType: 'uint32',
										fieldNumber: 10,
										maximum: 10000,
									},
									lastCommissionIncreaseHeight: {
										dataType: 'uint32',
										fieldNumber: 11,
									},
									sharingCoefficients: {
										type: 'array',
										fieldNumber: 12,
										items: {
											type: 'object',
											required: [
												'tokenID',
												'coefficient',
											],
											properties: {
												tokenID: {
													dataType: 'bytes',
													minLength: 8,
													maxLength: 8,
													fieldNumber: 1,
												},
												coefficient: {
													dataType: 'bytes',
													maxLength: 24,
													fieldNumber: 2,
												},
											},
										},
									},
								},
							},
						},
						stakers: {
							type: 'array',
							fieldNumber: 2,
							items: {
								type: 'object',
								required: [
									'address',
									'stakes',
									'pendingUnlocks',
								],
								properties: {
									address: {
										dataType: 'bytes',
										format: 'lisk32',
										fieldNumber: 1,
									},
									stakes: {
										type: 'array',
										fieldNumber: 2,
										items: {
											type: 'object',
											required: [
												'validatorAddress',
												'amount',
												'sharingCoefficients',
											],
											properties: {
												validatorAddress: {
													dataType: 'bytes',
													format: 'lisk32',
													fieldNumber: 1,
												},
												amount: {
													dataType: 'uint64',
													fieldNumber: 2,
												},
												sharingCoefficients: {
													type: 'array',
													fieldNumber: 3,
													items: {
														type: 'object',
														required: [
															'tokenID',
															'coefficient',
														],
														properties: {
															tokenID: {
																dataType: 'bytes',
																minLength: 8,
																maxLength: 8,
																fieldNumber: 1,
															},
															coefficient: {
																dataType: 'bytes',
																maxLength: 24,
																fieldNumber: 2,
															},
														},
													},
												},
											},
										},
									},
									pendingUnlocks: {
										type: 'array',
										fieldNumber: 3,
										items: {
											type: 'object',
											required: [
												'validatorAddress',
												'amount',
												'unstakeHeight',
											],
											properties: {
												validatorAddress: {
													dataType: 'bytes',
													fieldNumber: 1,
													format: 'lisk32',
												},
												amount: {
													dataType: 'uint64',
													fieldNumber: 2,
												},
												unstakeHeight: {
													dataType: 'uint32',
													fieldNumber: 3,
												},
											},
										},
									},
								},
							},
						},
						genesisData: {
							type: 'object',
							fieldNumber: 3,
							required: [
								'initRounds',
								'initValidators',
							],
							properties: {
								initRounds: {
									dataType: 'uint32',
									fieldNumber: 1,
								},
								initValidators: {
									type: 'array',
									fieldNumber: 2,
									items: {
										dataType: 'bytes',
										format: 'lisk32',
									},
								},
							},
						},
					},
				},
			},
			{
				module: 'random',
				version: 2,
				schema: {
					$id: '/modules/random/block/header/asset',
					type: 'object',
					properties: {
						seedReveal: {
							dataType: 'bytes',
							fieldNumber: 1,
							minLength: 16,
							maxLength: 16,
						},
					},
					required: [
						'seedReveal',
					],
				},
			},
			{
				module: 'token',
				version: 0,
				schema: {
					$id: '/token/module/genesis',
					type: 'object',
					required: [
						'userSubstore',
						'supplySubstore',
						'escrowSubstore',
						'supportedTokensSubstore',
					],
					properties: {
						userSubstore: {
							type: 'array',
							fieldNumber: 1,
							items: {
								type: 'object',
								required: [
									'address',
									'tokenID',
									'availableBalance',
									'lockedBalances',
								],
								properties: {
									address: {
										dataType: 'bytes',
										format: 'lisk32',
										fieldNumber: 1,
									},
									tokenID: {
										dataType: 'bytes',
										fieldNumber: 2,
										minLength: 8,
										maxLength: 8,
									},
									availableBalance: {
										dataType: 'uint64',
										fieldNumber: 3,
									},
									lockedBalances: {
										type: 'array',
										fieldNumber: 4,
										items: {
											type: 'object',
											required: [
												'module',
												'amount',
											],
											properties: {
												module: {
													dataType: 'string',
													minLength: 1,
													maxLength: 32,
													fieldNumber: 1,
												},
												amount: {
													dataType: 'uint64',
													fieldNumber: 2,
												},
											},
										},
									},
								},
							},
						},
						supplySubstore: {
							type: 'array',
							fieldNumber: 2,
							items: {
								type: 'object',
								required: [
									'tokenID',
									'totalSupply',
								],
								properties: {
									tokenID: {
										dataType: 'bytes',
										fieldNumber: 1,
										minLength: 8,
										maxLength: 8,
									},
									totalSupply: {
										dataType: 'uint64',
										fieldNumber: 2,
									},
								},
							},
						},
						escrowSubstore: {
							type: 'array',
							fieldNumber: 3,
							items: {
								type: 'object',
								required: [
									'escrowChainID',
									'tokenID',
									'amount',
								],
								properties: {
									escrowChainID: {
										dataType: 'bytes',
										minLength: 4,
										maxLength: 4,
										fieldNumber: 1,
									},
									tokenID: {
										dataType: 'bytes',
										fieldNumber: 2,
										minLength: 8,
										maxLength: 8,
									},
									amount: {
										dataType: 'uint64',
										fieldNumber: 3,
									},
								},
							},
						},
						supportedTokensSubstore: {
							type: 'array',
							fieldNumber: 4,
							items: {
								type: 'object',
								required: [
									'chainID',
									'supportedTokenIDs',
								],
								properties: {
									chainID: {
										dataType: 'bytes',
										fieldNumber: 1,
									},
									supportedTokenIDs: {
										type: 'array',
										fieldNumber: 2,
										items: {
											dataType: 'bytes',
											minLength: 8,
											maxLength: 8,
										},
									},
								},
							},
						},
					},
				},
			},
		],
		commands: [
			{
				moduleCommand: 'auth:registerMultisignature',
				schema: {
					$id: '/auth/command/regMultisig',
					type: 'object',
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
						signatures: {
							type: 'array',
							items: {
								dataType: 'bytes',
								minLength: 64,
								maxLength: 64,
							},
							fieldNumber: 4,
						},
					},
					required: [
						'numberOfSignatures',
						'mandatoryKeys',
						'optionalKeys',
						'signatures',
					],
				},
			},
			{
				moduleCommand: 'interoperability:submitMainchainCrossChainUpdate',
				schema: {
					$id: '/modules/interoperability/ccu',
					type: 'object',
					required: [
						'sendingChainID',
						'certificate',
						'activeValidatorsUpdate',
						'certificateThreshold',
						'inboxUpdate',
					],
					properties: {
						sendingChainID: {
							dataType: 'bytes',
							fieldNumber: 1,
							minLength: 4,
							maxLength: 4,
						},
						certificate: {
							dataType: 'bytes',
							fieldNumber: 2,
						},
						activeValidatorsUpdate: {
							type: 'object',
							fieldNumber: 3,
							required: [
								'blsKeysUpdate',
								'bftWeightsUpdate',
								'bftWeightsUpdateBitmap',
							],
							properties: {
								blsKeysUpdate: {
									type: 'array',
									fieldNumber: 1,
									items: {
										dataType: 'bytes',
										minLength: 48,
										maxLength: 48,
									},
								},
								bftWeightsUpdate: {
									type: 'array',
									fieldNumber: 2,
									items: {
										dataType: 'uint64',
									},
								},
								bftWeightsUpdateBitmap: {
									dataType: 'bytes',
									fieldNumber: 3,
								},
							},
						},
						certificateThreshold: {
							dataType: 'uint64',
							fieldNumber: 4,
						},
						inboxUpdate: {
							type: 'object',
							fieldNumber: 5,
							required: [
								'crossChainMessages',
								'messageWitnessHashes',
								'outboxRootWitness',
							],
							properties: {
								crossChainMessages: {
									type: 'array',
									fieldNumber: 1,
									items: {
										dataType: 'bytes',
									},
								},
								messageWitnessHashes: {
									type: 'array',
									fieldNumber: 2,
									items: {
										dataType: 'bytes',
										minLength: 32,
										maxLength: 32,
									},
								},
								outboxRootWitness: {
									type: 'object',
									fieldNumber: 3,
									required: [
										'bitmap',
										'siblingHashes',
									],
									properties: {
										bitmap: {
											dataType: 'bytes',
											fieldNumber: 1,
										},
										siblingHashes: {
											type: 'array',
											fieldNumber: 2,
											items: {
												dataType: 'bytes',
												minLength: 32,
												maxLength: 32,
											},
										},
									},
								},
							},
						},
					},
				},
			},
			{
				moduleCommand: 'interoperability:initializeMessageRecovery',
				schema: {
					$id: '/modules/interoperability/mainchain/messageRecoveryInitialization',
					type: 'object',
					required: [
						'chainID',
						'channel',
						'bitmap',
						'siblingHashes',
					],
					properties: {
						chainID: {
							dataType: 'bytes',
							fieldNumber: 1,
							minLength: 4,
							maxLength: 4,
						},
						channel: {
							dataType: 'bytes',
							fieldNumber: 2,
						},
						bitmap: {
							dataType: 'bytes',
							fieldNumber: 3,
						},
						siblingHashes: {
							type: 'array',
							items: {
								dataType: 'bytes',
								minLength: 32,
								maxLength: 32,
							},
							fieldNumber: 4,
						},
					},
				},
			},
			{
				moduleCommand: 'interoperability:recoverMessage',
				schema: {
					$id: '/modules/interoperability/mainchain/messageRecovery',
					type: 'object',
					required: [
						'chainID',
						'crossChainMessages',
						'idxs',
						'siblingHashes',
					],
					properties: {
						chainID: {
							dataType: 'bytes',
							minLength: 4,
							maxLength: 4,
							fieldNumber: 1,
						},
						crossChainMessages: {
							type: 'array',
							items: {
								dataType: 'bytes',
							},
							fieldNumber: 2,
						},
						idxs: {
							type: 'array',
							items: {
								dataType: 'uint32',
							},
							fieldNumber: 3,
						},
						siblingHashes: {
							type: 'array',
							items: {
								dataType: 'bytes',
								minLength: 32,
								maxLength: 32,
							},
							fieldNumber: 4,
						},
					},
				},
			},
			{
				moduleCommand: 'interoperability:registerSidechain',
				schema: {
					$id: '/modules/interoperability/mainchain/sidechainRegistration',
					type: 'object',
					required: [
						'chainID',
						'name',
						'sidechainValidators',
						'sidechainCertificateThreshold',
					],
					properties: {
						chainID: {
							dataType: 'bytes',
							fieldNumber: 1,
							minLength: 4,
							maxLength: 4,
						},
						name: {
							dataType: 'string',
							fieldNumber: 2,
							minLength: 1,
							maxLength: 32,
						},
						sidechainValidators: {
							type: 'array',
							items: {
								type: 'object',
								required: [
									'blsKey',
									'bftWeight',
								],
								properties: {
									blsKey: {
										dataType: 'bytes',
										fieldNumber: 1,
										minLength: 48,
										maxLength: 48,
									},
									bftWeight: {
										dataType: 'uint64',
										fieldNumber: 2,
									},
								},
							},
							minItems: 1,
							fieldNumber: 3,
							maxItems: 199,
						},
						sidechainCertificateThreshold: {
							dataType: 'uint64',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				moduleCommand: 'interoperability:recoverState',
				schema: {
					$id: '/modules/interoperability/mainchain/commands/stateRecovery',
					type: 'object',
					required: [
						'chainID',
						'module',
						'storeEntries',
						'siblingHashes',
					],
					properties: {
						chainID: {
							dataType: 'bytes',
							fieldNumber: 1,
							minLength: 4,
							maxLength: 4,
						},
						module: {
							dataType: 'string',
							fieldNumber: 2,
							minLength: 1,
							maxLength: 32,
						},
						storeEntries: {
							type: 'array',
							fieldNumber: 3,
							items: {
								type: 'object',
								properties: {
									substorePrefix: {
										dataType: 'bytes',
										fieldNumber: 1,
										minLength: 2,
										maxLength: 2,
									},
									storeKey: {
										dataType: 'bytes',
										fieldNumber: 2,
									},
									storeValue: {
										dataType: 'bytes',
										fieldNumber: 3,
									},
									bitmap: {
										dataType: 'bytes',
										fieldNumber: 4,
									},
								},
								required: [
									'substorePrefix',
									'storeKey',
									'storeValue',
									'bitmap',
								],
							},
						},
						siblingHashes: {
							type: 'array',
							items: {
								dataType: 'bytes',
								minLength: 32,
								maxLength: 32,
							},
							fieldNumber: 4,
						},
					},
				},
			},
			{
				moduleCommand: 'interoperability:terminateSidechainForLiveness',
				schema: {
					$id: '/modules/interoperability/mainchain/terminateSidechainForLiveness',
					type: 'object',
					required: [
						'chainID',
					],
					properties: {
						chainID: {
							dataType: 'bytes',
							fieldNumber: 1,
							minLength: 4,
							maxLength: 4,
						},
					},
				},
			},
			{
				moduleCommand: 'legacy:reclaimLSK',
				schema: {
					$id: '/legacy/command/reclaimLSKParams',
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
			{
				moduleCommand: 'legacy:registerKeys',
				schema: {
					$id: '/legacy/command/registerKeysParams',
					type: 'object',
					required: [
						'blsKey',
						'proofOfPossession',
						'generatorKey',
					],
					properties: {
						blsKey: {
							dataType: 'bytes',
							minLength: 48,
							maxLength: 48,
							fieldNumber: 1,
						},
						proofOfPossession: {
							dataType: 'bytes',
							minLength: 96,
							maxLength: 96,
							fieldNumber: 2,
						},
						generatorKey: {
							dataType: 'bytes',
							minLength: 32,
							maxLength: 32,
							fieldNumber: 3,
						},
					},
				},
			},
			{
				moduleCommand: 'pos:registerValidator',
				schema: {
					$id: '/pos/command/registerValidatorParams',
					type: 'object',
					required: [
						'name',
						'blsKey',
						'proofOfPossession',
						'generatorKey',
					],
					properties: {
						name: {
							dataType: 'string',
							fieldNumber: 1,
							minLength: 1,
							maxLength: 20,
						},
						blsKey: {
							dataType: 'bytes',
							minLength: 48,
							maxLength: 48,
							fieldNumber: 2,
						},
						proofOfPossession: {
							dataType: 'bytes',
							minLength: 96,
							maxLength: 96,
							fieldNumber: 3,
						},
						generatorKey: {
							dataType: 'bytes',
							minLength: 32,
							maxLength: 32,
							fieldNumber: 4,
						},
					},
				},
			},
			{
				moduleCommand: 'pos:reportMisbehavior',
				schema: {
					$id: '/pos/command/reportMisbehaviorParams',
					type: 'object',
					required: [
						'header1',
						'header2',
					],
					properties: {
						header1: {
							dataType: 'bytes',
							fieldNumber: 1,
						},
						header2: {
							dataType: 'bytes',
							fieldNumber: 2,
						},
					},
				},
			},
			{
				moduleCommand: 'pos:unlock',
				schema: {
					$id: '/lisk/empty',
					type: 'object',
					properties: {},
				},
			},
			{
				moduleCommand: 'pos:updateGeneratorKey',
				schema: {
					$id: '/pos/command/updateGeneratorKeyParams',
					type: 'object',
					required: [
						'generatorKey',
					],
					properties: {
						generatorKey: {
							dataType: 'bytes',
							fieldNumber: 1,
							minLength: 32,
							maxLength: 32,
						},
					},
				},
			},
			{
				moduleCommand: 'pos:stake',
				schema: {
					$id: '/pos/command/stakeValidatorParams',
					type: 'object',
					required: [
						'stakes',
					],
					properties: {
						stakes: {
							type: 'array',
							fieldNumber: 1,
							minItems: 1,
							maxItems: 20,
							items: {
								type: 'object',
								required: [
									'validatorAddress',
									'amount',
								],
								properties: {
									validatorAddress: {
										dataType: 'bytes',
										fieldNumber: 1,
										format: 'lisk32',
									},
									amount: {
										dataType: 'sint64',
										fieldNumber: 2,
									},
								},
							},
						},
					},
				},
			},
			{
				moduleCommand: 'pos:changeCommission',
				schema: {
					$id: '/pos/command/changeCommissionCommandParams',
					type: 'object',
					required: [
						'newCommission',
					],
					properties: {
						newCommission: {
							dataType: 'uint32',
							fieldNumber: 1,
							maximum: 10000,
						},
					},
				},
			},
			{
				moduleCommand: 'pos:claimRewards',
				schema: {
					$id: '/lisk/empty',
					type: 'object',
					properties: {},
				},
			},
			{
				moduleCommand: 'token:transfer',
				schema: {
					$id: '/lisk/transferParams',
					title: 'Transfer transaction params',
					type: 'object',
					required: [
						'tokenID',
						'amount',
						'recipientAddress',
						'data',
					],
					properties: {
						tokenID: {
							dataType: 'bytes',
							fieldNumber: 1,
							minLength: 8,
							maxLength: 8,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 2,
						},
						recipientAddress: {
							dataType: 'bytes',
							fieldNumber: 3,
							format: 'lisk32',
						},
						data: {
							dataType: 'string',
							fieldNumber: 4,
							minLength: 0,
							maxLength: 64,
						},
					},
				},
			},
			{
				moduleCommand: 'token:transferCrossChain',
				schema: {
					$id: '/lisk/ccTransferParams',
					type: 'object',
					required: [
						'tokenID',
						'amount',
						'receivingChainID',
						'recipientAddress',
						'data',
						'messageFee',
						'messageFeeTokenID',
					],
					properties: {
						tokenID: {
							dataType: 'bytes',
							fieldNumber: 1,
							minLength: 8,
							maxLength: 8,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 2,
						},
						receivingChainID: {
							dataType: 'bytes',
							fieldNumber: 3,
							minLength: 4,
							maxLength: 4,
						},
						recipientAddress: {
							dataType: 'bytes',
							fieldNumber: 4,
							format: 'lisk32',
						},
						data: {
							dataType: 'string',
							fieldNumber: 5,
							minLength: 0,
							maxLength: 64,
						},
						messageFee: {
							dataType: 'uint64',
							fieldNumber: 6,
						},
						messageFeeTokenID: {
							dataType: 'bytes',
							fieldNumber: 7,
							minLength: 8,
							maxLength: 8,
						},
					},
				},
			},
		],
		events: [
			{
				module: 'auth',
				name: 'multisignatureRegistration',
				schema: {
					$id: '/auth/events/multisigRegData',
					type: 'object',
					required: [
						'numberOfSignatures',
						'mandatoryKeys',
						'optionalKeys',
					],
					properties: {
						numberOfSignatures: {
							dataType: 'uint32',
							fieldNumber: 1,
						},
						mandatoryKeys: {
							type: 'array',
							items: {
								dataType: 'bytes',
								minLength: 32,
								maxLength: 32,
							},
							fieldNumber: 2,
						},
						optionalKeys: {
							type: 'array',
							items: {
								dataType: 'bytes',
								minLength: 32,
								maxLength: 32,
							},
							fieldNumber: 3,
						},
					},
				},
			},
			{
				module: 'auth',
				name: 'invalidSignature',
				schema: {
					$id: '/auth/events/invalidSigData',
					type: 'object',
					required: [
						'numberOfSignatures',
						'mandatoryKeys',
						'optionalKeys',
						'failingPublicKey',
						'failingSignature',
					],
					properties: {
						numberOfSignatures: {
							dataType: 'uint32',
							fieldNumber: 1,
						},
						mandatoryKeys: {
							type: 'array',
							items: {
								dataType: 'bytes',
								minLength: 32,
								maxLength: 32,
							},
							fieldNumber: 2,
						},
						optionalKeys: {
							type: 'array',
							items: {
								dataType: 'bytes',
								minLength: 32,
								maxLength: 32,
							},
							fieldNumber: 3,
						},
						failingPublicKey: {
							dataType: 'bytes',
							minLength: 32,
							maxLength: 32,
							fieldNumber: 4,
						},
						failingSignature: {
							dataType: 'bytes',
							minLength: 64,
							maxLength: 64,
							fieldNumber: 5,
						},
					},
				},
			},
			{
				module: 'dynamicReward',
				name: 'rewardMinted',
				schema: {
					$id: '/reward/events/rewardMintedData',
					type: 'object',
					required: [
						'amount',
						'reduction',
					],
					properties: {
						amount: {
							dataType: 'uint64',
							fieldNumber: 1,
						},
						reduction: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
					},
				},
			},
			{
				module: 'fee',
				name: 'generatorFeeProcessed',
				schema: {
					$id: '/fee/events/generatorFeeProcessed',
					type: 'object',
					required: [
						'senderAddress',
						'generatorAddress',
						'burntAmount',
						'generatorAmount',
					],
					properties: {
						senderAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						generatorAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 2,
						},
						burntAmount: {
							dataType: 'uint64',
							fieldNumber: 3,
						},
						generatorAmount: {
							dataType: 'uint64',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				module: 'fee',
				name: 'relayerFeeProcessed',
				schema: {
					$id: '/fee/events/relayerFeeProcessed',
					type: 'object',
					required: [
						'ccmID',
						'relayerAddress',
						'burntAmount',
						'relayerAmount',
					],
					properties: {
						ccmID: {
							dataType: 'bytes',
							minLength: 32,
							maxLength: 32,
							fieldNumber: 1,
						},
						relayerAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 2,
						},
						burntAmount: {
							dataType: 'uint64',
							fieldNumber: 3,
						},
						relayerAmount: {
							dataType: 'uint64',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				module: 'fee',
				name: 'insufficientFee',
				schema: {
					$id: '/lisk/empty',
					type: 'object',
					properties: {},
				},
			},
			{
				module: 'interoperability',
				name: 'chainAccountUpdated',
				schema: {
					$id: '/modules/interoperability/chainData',
					type: 'object',
					required: [
						'name',
						'lastCertificate',
						'status',
					],
					properties: {
						name: {
							dataType: 'string',
							minLength: 1,
							maxLength: 32,
							fieldNumber: 1,
						},
						lastCertificate: {
							type: 'object',
							fieldNumber: 2,
							required: [
								'height',
								'timestamp',
								'stateRoot',
								'validatorsHash',
							],
							properties: {
								height: {
									dataType: 'uint32',
									fieldNumber: 1,
								},
								timestamp: {
									dataType: 'uint32',
									fieldNumber: 2,
								},
								stateRoot: {
									dataType: 'bytes',
									minLength: 32,
									maxLength: 32,
									fieldNumber: 3,
								},
								validatorsHash: {
									dataType: 'bytes',
									minLength: 32,
									maxLength: 32,
									fieldNumber: 4,
								},
							},
						},
						status: {
							dataType: 'uint32',
							fieldNumber: 3,
						},
					},
				},
			},
			{
				module: 'interoperability',
				name: 'ccmProcessed',
				schema: {
					$id: '/interoperability/events/ccmProcessed',
					type: 'object',
					required: [
						'ccm',
						'result',
						'code',
					],
					properties: {
						ccm: {
							fieldNumber: 1,
							type: 'object',
							required: [
								'module',
								'crossChainCommand',
								'nonce',
								'fee',
								'sendingChainID',
								'receivingChainID',
								'params',
								'status',
							],
							properties: {
								module: {
									dataType: 'string',
									minLength: 1,
									maxLength: 32,
									fieldNumber: 1,
								},
								crossChainCommand: {
									dataType: 'string',
									minLength: 1,
									maxLength: 32,
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
								sendingChainID: {
									dataType: 'bytes',
									minLength: 4,
									maxLength: 4,
									fieldNumber: 5,
								},
								receivingChainID: {
									dataType: 'bytes',
									minLength: 4,
									maxLength: 4,
									fieldNumber: 6,
								},
								params: {
									dataType: 'bytes',
									fieldNumber: 7,
								},
								status: {
									dataType: 'uint32',
									fieldNumber: 8,
								},
							},
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
						code: {
							dataType: 'uint32',
							fieldNumber: 3,
						},
					},
				},
			},
			{
				module: 'interoperability',
				name: 'ccmSendSuccess',
				schema: {
					$id: '/interoperability/events/ccmSendSuccess',
					type: 'object',
					required: [
						'ccm',
					],
					properties: {
						ccm: {
							fieldNumber: 1,
							type: 'object',
							required: [
								'module',
								'crossChainCommand',
								'nonce',
								'fee',
								'sendingChainID',
								'receivingChainID',
								'params',
								'status',
							],
							properties: {
								module: {
									dataType: 'string',
									minLength: 1,
									maxLength: 32,
									fieldNumber: 1,
								},
								crossChainCommand: {
									dataType: 'string',
									minLength: 1,
									maxLength: 32,
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
								sendingChainID: {
									dataType: 'bytes',
									minLength: 4,
									maxLength: 4,
									fieldNumber: 5,
								},
								receivingChainID: {
									dataType: 'bytes',
									minLength: 4,
									maxLength: 4,
									fieldNumber: 6,
								},
								params: {
									dataType: 'bytes',
									fieldNumber: 7,
								},
								status: {
									dataType: 'uint32',
									fieldNumber: 8,
								},
							},
						},
					},
				},
			},
			{
				module: 'interoperability',
				name: 'ccmSentFailed',
				schema: {
					$id: '/interoperability/events/ccmSendFail',
					type: 'object',
					required: [
						'ccm',
						'code',
					],
					properties: {
						ccm: {
							$id: '/modules/interoperability/ccm',
							type: 'object',
							required: [
								'module',
								'crossChainCommand',
								'nonce',
								'fee',
								'sendingChainID',
								'receivingChainID',
								'params',
								'status',
							],
							properties: {
								module: {
									dataType: 'string',
									minLength: 1,
									maxLength: 32,
									fieldNumber: 1,
								},
								crossChainCommand: {
									dataType: 'string',
									minLength: 1,
									maxLength: 32,
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
								sendingChainID: {
									dataType: 'bytes',
									minLength: 4,
									maxLength: 4,
									fieldNumber: 5,
								},
								receivingChainID: {
									dataType: 'bytes',
									minLength: 4,
									maxLength: 4,
									fieldNumber: 6,
								},
								params: {
									dataType: 'bytes',
									fieldNumber: 7,
								},
								status: {
									dataType: 'uint32',
									fieldNumber: 8,
								},
							},
							fieldNumber: 1,
						},
						code: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
					},
				},
			},
			{
				module: 'interoperability',
				name: 'invalidRegistrationSignature',
				schema: {
					$id: '/lisk/empty',
					type: 'object',
					properties: {},
				},
			},
			{
				module: 'interoperability',
				name: 'terminatedStateCreated',
				schema: {
					$id: '/modules/interoperability/terminatedState',
					type: 'object',
					required: [
						'stateRoot',
						'mainchainStateRoot',
						'initialized',
					],
					properties: {
						stateRoot: {
							dataType: 'bytes',
							minLength: 32,
							maxLength: 32,
							fieldNumber: 1,
						},
						mainchainStateRoot: {
							dataType: 'bytes',
							minLength: 32,
							maxLength: 32,
							fieldNumber: 2,
						},
						initialized: {
							dataType: 'boolean',
							fieldNumber: 3,
						},
					},
				},
			},
			{
				module: 'interoperability',
				name: 'terminatedOutboxCreated',
				schema: {
					$id: '/modules/interoperability/terminatedOutbox',
					type: 'object',
					required: [
						'outboxRoot',
						'outboxSize',
						'partnerChainInboxSize',
					],
					properties: {
						outboxRoot: {
							dataType: 'bytes',
							minLength: 32,
							maxLength: 32,
							fieldNumber: 1,
						},
						outboxSize: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
						partnerChainInboxSize: {
							dataType: 'uint32',
							fieldNumber: 3,
						},
					},
				},
			},
			{
				module: 'interoperability',
				name: 'invalidSMTVerification',
				schema: {
					$id: '/lisk/empty',
					type: 'object',
					properties: {},
				},
			},
			{
				module: 'interoperability',
				name: 'invalidRMTVerification',
				schema: {
					$id: '/lisk/empty',
					type: 'object',
					properties: {},
				},
			},
			{
				module: 'interoperability',
				name: 'invalidCertificateSignature',
				schema: {
					$id: '/lisk/empty',
					type: 'object',
					properties: {},
				},
			},
			{
				module: 'legacy',
				name: 'accountReclaimed',
				schema: {
					$id: 'lisk/legacy/accountReclaimedEventData',
					type: 'object',
					required: [
						'legacyAddress',
						'address',
						'amount',
					],
					properties: {
						legacyAddress: {
							dataType: 'bytes',
							maxLength: 8,
							fieldNumber: 1,
						},
						address: {
							dataType: 'bytes',
							maxLength: 20,
							fieldNumber: 2,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 3,
						},
					},
				},
			},
			{
				module: 'legacy',
				name: 'keysRegistered',
				schema: {
					$id: 'lisk/legacy/keysRegisteredEventData',
					type: 'object',
					required: [
						'address',
						'generatorKey',
						'blsKey',
					],
					properties: {
						address: {
							dataType: 'bytes',
							maxLength: 20,
							fieldNumber: 1,
						},
						generatorKey: {
							dataType: 'bytes',
							maxLength: 32,
							fieldNumber: 2,
						},
						blsKey: {
							dataType: 'bytes',
							maxLength: 48,
							fieldNumber: 3,
						},
					},
				},
			},
			{
				module: 'pos',
				name: 'validatorBanned',
				schema: {
					$id: '/pos/events/validatorBannedData',
					type: 'object',
					required: [
						'address',
						'height',
					],
					properties: {
						address: {
							dataType: 'bytes',
							fieldNumber: 1,
							format: 'lisk32',
						},
						height: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
					},
				},
			},
			{
				module: 'pos',
				name: 'validatorPunished',
				schema: {
					$id: '/pos/events/punishValidatorData',
					type: 'object',
					required: [
						'address',
						'height',
					],
					properties: {
						address: {
							dataType: 'bytes',
							fieldNumber: 1,
							format: 'lisk32',
						},
						height: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
					},
				},
			},
			{
				module: 'pos',
				name: 'validatorRegistered',
				schema: {
					$id: '/pos/events/registerValidatorData',
					type: 'object',
					required: [
						'address',
						'name',
					],
					properties: {
						address: {
							dataType: 'bytes',
							fieldNumber: 1,
							format: 'lisk32',
						},
						name: {
							dataType: 'string',
							fieldNumber: 2,
						},
					},
				},
			},
			{
				module: 'pos',
				name: 'validatorStaked',
				schema: {
					$id: '/pos/events/validatorStakedData',
					type: 'object',
					required: [
						'senderAddress',
						'validatorAddress',
						'amount',
						'result',
					],
					properties: {
						senderAddress: {
							dataType: 'bytes',
							fieldNumber: 1,
							format: 'lisk32',
						},
						validatorAddress: {
							dataType: 'bytes',
							fieldNumber: 2,
							format: 'lisk32',
						},
						amount: {
							dataType: 'sint64',
							fieldNumber: 3,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				module: 'pos',
				name: 'commissionChange',
				schema: {
					$id: '/pos/events/commissionChangeData',
					type: 'object',
					required: [
						'validatorAddress',
						'oldCommission',
						'newCommission',
					],
					properties: {
						validatorAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						oldCommission: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
						newCommission: {
							dataType: 'uint32',
							fieldNumber: 3,
						},
					},
				},
			},
			{
				module: 'pos',
				name: 'rewardsAssigned',
				schema: {
					$id: '/pos/events/rewardsAssignedData',
					type: 'object',
					required: [
						'stakerAddress',
						'validatorAddress',
						'tokenID',
						'amount',
					],
					properties: {
						stakerAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						validatorAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 2,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 3,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'transfer',
				schema: {
					$id: '/token/events/transfer',
					type: 'object',
					required: [
						'senderAddress',
						'recipientAddress',
						'tokenID',
						'amount',
						'result',
					],
					properties: {
						senderAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						recipientAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 2,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 3,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 4,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 5,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'transferCrossChain',
				schema: {
					$id: '/token/events/transferCrossChain',
					type: 'object',
					required: [
						'senderAddress',
						'recipientAddress',
						'tokenID',
						'amount',
						'receivingChainID',
						'result',
					],
					properties: {
						senderAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						recipientAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 2,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 3,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 4,
						},
						receivingChainID: {
							dataType: 'bytes',
							minLength: 4,
							maxLength: 4,
							fieldNumber: 5,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 6,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'ccmTransfer',
				schema: {
					$id: '/token/events/ccmTransfer',
					type: 'object',
					required: [
						'senderAddress',
						'recipientAddress',
						'tokenID',
						'amount',
						'receivingChainID',
						'result',
					],
					properties: {
						senderAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						recipientAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 2,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 3,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 4,
						},
						receivingChainID: {
							dataType: 'bytes',
							minLength: 4,
							maxLength: 4,
							fieldNumber: 5,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 6,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'mint',
				schema: {
					$id: '/token/events/mint',
					type: 'object',
					required: [
						'address',
						'tokenID',
						'amount',
						'result',
					],
					properties: {
						address: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 2,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 3,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'burn',
				schema: {
					$id: '/token/events/burn',
					type: 'object',
					required: [
						'address',
						'tokenID',
						'amount',
						'result',
					],
					properties: {
						address: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 2,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 3,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'lock',
				schema: {
					$id: '/token/events/lock',
					type: 'object',
					required: [
						'address',
						'module',
						'tokenID',
						'amount',
						'result',
					],
					properties: {
						address: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						module: {
							dataType: 'string',
							minLength: 1,
							maxLength: 32,
							fieldNumber: 2,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 3,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 4,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 5,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'unlock',
				schema: {
					$id: '/token/events/unlock',
					type: 'object',
					required: [
						'address',
						'module',
						'tokenID',
						'amount',
						'result',
					],
					properties: {
						address: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						module: {
							dataType: 'string',
							minLength: 1,
							maxLength: 32,
							fieldNumber: 2,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 3,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 4,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 5,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'initializeToken',
				schema: {
					$id: '/token/events/initializeTokenEvent',
					type: 'object',
					required: [
						'tokenID',
						'result',
					],
					properties: {
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 1,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'initializeUserAccount',
				schema: {
					$id: '/token/events/initializeUserAccount',
					type: 'object',
					required: [
						'address',
						'tokenID',
						'initializationFee',
						'result',
					],
					properties: {
						address: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 1,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 2,
						},
						initializationFee: {
							dataType: 'uint64',
							fieldNumber: 3,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'initializeEscrowAccount',
				schema: {
					$id: '/token/events/initializeEscrowAccount',
					type: 'object',
					required: [
						'chainID',
						'tokenID',
						'initializationFee',
						'result',
					],
					properties: {
						chainID: {
							dataType: 'bytes',
							minLength: 4,
							maxLength: 4,
							fieldNumber: 1,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 2,
						},
						initializationFee: {
							dataType: 'uint64',
							fieldNumber: 3,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'recover',
				schema: {
					$id: '/token/events/recover',
					type: 'object',
					required: [
						'terminatedChainID',
						'tokenID',
						'amount',
						'result',
					],
					properties: {
						terminatedChainID: {
							dataType: 'bytes',
							minLength: 4,
							maxLength: 4,
							fieldNumber: 1,
						},
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 2,
						},
						amount: {
							dataType: 'uint64',
							fieldNumber: 3,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'beforeCCCExecution',
				schema: {
					$id: '/token/events/beforeCCCExecution',
					type: 'object',
					required: [
						'ccmID',
						'messageFeeTokenID',
						'relayerAddress',
						'result',
					],
					properties: {
						ccmID: {
							dataType: 'bytes',
							minLength: 32,
							maxLength: 32,
							fieldNumber: 1,
						},
						messageFeeTokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 2,
						},
						relayerAddress: {
							dataType: 'bytes',
							format: 'lisk32',
							fieldNumber: 3,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 4,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'beforeCCMForwarding',
				schema: {
					$id: '/token/events/beforeCCMForwarding',
					type: 'object',
					required: [
						'ccmID',
						'messageFeeTokenID',
						'result',
					],
					properties: {
						ccmID: {
							dataType: 'bytes',
							minLength: 32,
							maxLength: 32,
							fieldNumber: 1,
						},
						messageFeeTokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 2,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 3,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'allTokensSupported',
				schema: {
					$id: '/lisk/empty',
					type: 'object',
					properties: {},
				},
			},
			{
				module: 'token',
				name: 'allTokensSupportRemoved',
				schema: {
					$id: '/lisk/empty',
					type: 'object',
					properties: {},
				},
			},
			{
				module: 'token',
				name: 'allTokensFromChainSupported',
				schema: {
					$id: '/token/events/allTokensFromChainSupported',
					type: 'object',
					required: [
						'chainID',
					],
					properties: {
						chainID: {
							dataType: 'bytes',
							minLength: 4,
							maxLength: 4,
							fieldNumber: 1,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'allTokensFromChainSupportRemoved',
				schema: {
					$id: '/token/events/allTokensFromChainSupportRemoved',
					type: 'object',
					required: [
						'chainID',
					],
					properties: {
						chainID: {
							dataType: 'bytes',
							minLength: 4,
							maxLength: 4,
							fieldNumber: 1,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'tokenIDSupported',
				schema: {
					$id: '/token/events/tokenIDSupported',
					type: 'object',
					required: [
						'tokenID',
					],
					properties: {
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 1,
						},
					},
				},
			},
			{
				module: 'token',
				name: 'tokenIDSupportRemoved',
				schema: {
					$id: '/token/events/tokenIDSupportRemoved',
					type: 'object',
					required: [
						'tokenID',
					],
					properties: {
						tokenID: {
							dataType: 'bytes',
							minLength: 8,
							maxLength: 8,
							fieldNumber: 1,
						},
					},
				},
			},
			{
				module: 'validators',
				name: 'generatorKeyRegistration',
				schema: {
					$id: '/validators/event/generatorKeyRegData',
					type: 'object',
					required: [
						'generatorKey',
						'result',
					],
					properties: {
						generatorKey: {
							dataType: 'bytes',
							minLength: 32,
							maxLength: 32,
							fieldNumber: 1,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 2,
						},
					},
				},
			},
			{
				module: 'validators',
				name: 'blsKeyRegistration',
				schema: {
					$id: '/validators/event/blsKeyRegData',
					type: 'object',
					required: [
						'blsKey',
						'proofOfPossession',
						'result',
					],
					properties: {
						blsKey: {
							dataType: 'bytes',
							minLength: 48,
							maxLength: 48,
							fieldNumber: 1,
						},
						proofOfPossession: {
							dataType: 'bytes',
							minLength: 96,
							maxLength: 96,
							fieldNumber: 2,
						},
						result: {
							dataType: 'uint32',
							fieldNumber: 3,
						},
					},
				},
			},
		],
		block: {
			schema: {
				$id: '/block',
				type: 'object',
				properties: {
					header: {
						dataType: 'bytes',
						fieldNumber: 1,
					},
					transactions: {
						type: 'array',
						items: {
							dataType: 'bytes',
						},
						fieldNumber: 2,
					},
					assets: {
						type: 'array',
						items: {
							dataType: 'bytes',
						},
						fieldNumber: 3,
					},
				},
				required: [
					'header',
					'transactions',
					'assets',
				],
			},
		},
		header: {
			schema: {
				$id: '/block/header/3/without-id',
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
					generatorAddress: {
						dataType: 'bytes',
						fieldNumber: 5,
						format: 'lisk32',
					},
					transactionRoot: {
						dataType: 'bytes',
						fieldNumber: 6,
					},
					assetRoot: {
						dataType: 'bytes',
						fieldNumber: 7,
					},
					eventRoot: {
						dataType: 'bytes',
						fieldNumber: 8,
					},
					stateRoot: {
						dataType: 'bytes',
						fieldNumber: 9,
					},
					maxHeightPrevoted: {
						dataType: 'uint32',
						fieldNumber: 10,
					},
					maxHeightGenerated: {
						dataType: 'uint32',
						fieldNumber: 11,
					},
					impliesMaxPrevotes: {
						dataType: 'boolean',
						fieldNumber: 12,
					},
					validatorsHash: {
						dataType: 'bytes',
						fieldNumber: 13,
					},
					aggregateCommit: {
						type: 'object',
						fieldNumber: 14,
						required: [
							'height',
							'aggregationBits',
							'certificateSignature',
						],
						properties: {
							height: {
								dataType: 'uint32',
								fieldNumber: 1,
							},
							aggregationBits: {
								dataType: 'bytes',
								fieldNumber: 2,
							},
							certificateSignature: {
								dataType: 'bytes',
								fieldNumber: 3,
							},
						},
					},
					signature: {
						dataType: 'bytes',
						fieldNumber: 15,
					},
				},
				required: [
					'version',
					'timestamp',
					'height',
					'previousBlockID',
					'generatorAddress',
					'transactionRoot',
					'assetRoot',
					'eventRoot',
					'stateRoot',
					'maxHeightPrevoted',
					'maxHeightGenerated',
					'impliesMaxPrevotes',
					'validatorsHash',
					'aggregateCommit',
					'signature',
				],
			},
		},
		asset: {
			schema: {
				$id: '/block/asset/3',
				type: 'object',
				required: [
					'module',
					'data',
				],
				properties: {
					module: {
						dataType: 'string',
						fieldNumber: 1,
					},
					data: {
						dataType: 'bytes',
						fieldNumber: 2,
					},
				},
			},
		},
		transaction: {
			schema: {
				$id: '/lisk/transaction',
				type: 'object',
				required: [
					'module',
					'command',
					'nonce',
					'fee',
					'senderPublicKey',
					'params',
				],
				properties: {
					module: {
						dataType: 'string',
						fieldNumber: 1,
						minLength: 1,
						maxLength: 32,
					},
					command: {
						dataType: 'string',
						fieldNumber: 2,
						minLength: 1,
						maxLength: 32,
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
					params: {
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
		},
		event: {
			schema: {
				$id: '/block/event',
				type: 'object',
				required: [
					'module',
					'name',
					'data',
					'topics',
					'height',
					'index',
				],
				properties: {
					module: {
						dataType: 'string',
						minLength: 1,
						maxLength: 32,
						fieldNumber: 1,
					},
					name: {
						dataType: 'string',
						minLength: 1,
						maxLength: 32,
						fieldNumber: 2,
					},
					data: {
						dataType: 'bytes',
						fieldNumber: 3,
					},
					topics: {
						type: 'array',
						fieldNumber: 4,
						maxItems: 4,
						items: {
							dataType: 'bytes',
						},
					},
					height: {
						dataType: 'uint32',
						fieldNumber: 5,
					},
					index: {
						dataType: 'uint32',
						fieldNumber: 6,
						maximum: 1073741823,
					},
				},
			},
		},
		standardEvent: {
			schema: {
				$id: '/block/event/standard',
				type: 'object',
				required: [
					'success',
				],
				properties: {
					success: {
						dataType: 'boolean',
						fieldNumber: 1,
					},
				},
			},
		},
		ccm: {
			schema: {
				$id: '/modules/interoperability/ccm',
				type: 'object',
				required: [
					'module',
					'crossChainCommand',
					'nonce',
					'fee',
					'sendingChainID',
					'receivingChainID',
					'params',
					'status',
				],
				properties: {
					module: {
						dataType: 'string',
						minLength: 1,
						maxLength: 32,
						fieldNumber: 1,
					},
					crossChainCommand: {
						dataType: 'string',
						minLength: 1,
						maxLength: 32,
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
					sendingChainID: {
						dataType: 'bytes',
						minLength: 4,
						maxLength: 4,
						fieldNumber: 5,
					},
					receivingChainID: {
						dataType: 'bytes',
						minLength: 4,
						maxLength: 4,
						fieldNumber: 6,
					},
					params: {
						dataType: 'bytes',
						fieldNumber: 7,
					},
					status: {
						dataType: 'uint32',
						fieldNumber: 8,
					},
				},
			},
		},
		messages: [
			{
				moduleCommand: 'auth:registerMultisignature',
				param: 'signatures',
				schema: {
					$id: '/auth/command/regMultisigMsg',
					type: 'object',
					required: [
						'address',
						'nonce',
						'numberOfSignatures',
						'mandatoryKeys',
						'optionalKeys',
					],
					properties: {
						address: {
							dataType: 'bytes',
							fieldNumber: 1,
							minLength: 20,
							maxLength: 20,
						},
						nonce: {
							dataType: 'uint64',
							fieldNumber: 2,
						},
						numberOfSignatures: {
							dataType: 'uint32',
							fieldNumber: 3,
						},
						mandatoryKeys: {
							type: 'array',
							items: {
								dataType: 'bytes',
								minLength: 32,
								maxLength: 32,
							},
							fieldNumber: 4,
						},
						optionalKeys: {
							type: 'array',
							items: {
								dataType: 'bytes',
								minLength: 32,
								maxLength: 32,
							},
							fieldNumber: 5,
						},
					},
				},
			},
		],
	},
	meta: {},
};

module.exports = {
	schemas,
};
