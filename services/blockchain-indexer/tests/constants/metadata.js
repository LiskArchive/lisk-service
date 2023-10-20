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
const metadata = {
	modules: [
		{
			commands: [
				{
					name: 'registerMultisignature',
					params: {
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
			],
			events: [
				{
					name: 'multisignatureRegistration',
					data: {
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
					name: 'invalidSignature',
					data: {
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
			],
			stores: [
				{
					key: '3df49c3c0000',
					data: {
						$id: '/auth/account',
						type: 'object',
						properties: {
							nonce: {
								dataType: 'uint64',
								fieldNumber: 1,
							},
							numberOfSignatures: {
								dataType: 'uint32',
								fieldNumber: 2,
								minimum: 0,
								maximum: 64,
							},
							mandatoryKeys: {
								type: 'array',
								items: {
									dataType: 'bytes',
									minLength: 32,
									maxLength: 32,
								},
								minItems: 0,
								maxItems: 64,
								fieldNumber: 3,
							},
							optionalKeys: {
								type: 'array',
								items: {
									dataType: 'bytes',
									minLength: 32,
									maxLength: 32,
								},
								minItems: 0,
								maxItems: 64,
								fieldNumber: 4,
							},
						},
						required: [
							'nonce',
							'numberOfSignatures',
							'mandatoryKeys',
							'optionalKeys',
						],
					},
				},
			],
			endpoints: [
				{
					name: 'getAuthAccount',
					request: {
						$id: '/auth/addressRequest',
						type: 'object',
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
						},
						required: [
							'address',
						],
					},
					response: {
						$id: '/auth/account',
						type: 'object',
						properties: {
							nonce: {
								dataType: 'uint64',
								fieldNumber: 1,
							},
							numberOfSignatures: {
								dataType: 'uint32',
								fieldNumber: 2,
								minimum: 0,
								maximum: 64,
							},
							mandatoryKeys: {
								type: 'array',
								items: {
									dataType: 'bytes',
									minLength: 32,
									maxLength: 32,
								},
								minItems: 0,
								maxItems: 64,
								fieldNumber: 3,
							},
							optionalKeys: {
								type: 'array',
								items: {
									dataType: 'bytes',
									minLength: 32,
									maxLength: 32,
								},
								minItems: 0,
								maxItems: 64,
								fieldNumber: 4,
							},
						},
						required: [
							'nonce',
							'numberOfSignatures',
							'mandatoryKeys',
							'optionalKeys',
						],
					},
				},
				{
					name: 'isValidNonce',
					request: {
						$id: '/auth/transactionRequest',
						type: 'object',
						properties: {
							transaction: {
								type: 'string',
								format: 'hex',
							},
						},
						required: [
							'transaction',
						],
					},
					response: {
						$id: '/auth/verifyResult',
						type: 'object',
						properties: {
							verified: {
								type: 'boolean',
							},
						},
						required: [
							'verified',
						],
					},
				},
				{
					name: 'isValidSignature',
					request: {
						$id: '/auth/transactionRequest',
						type: 'object',
						properties: {
							transaction: {
								type: 'string',
								format: 'hex',
							},
						},
						required: [
							'transaction',
						],
					},
					response: {
						$id: '/auth/verifyResult',
						type: 'object',
						properties: {
							verified: {
								type: 'boolean',
							},
						},
						required: [
							'verified',
						],
					},
				},
				{
					name: 'getMultiSigRegMsgSchema',
					response: {
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
				{
					name: 'sortMultisignatureGroup',
					request: {
						$id: '/auth/command/sortMultisig',
						required: [
							'mandatory',
							'optional',
						],
						type: 'object',
						properties: {
							mandatory: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										publicKey: {
											type: 'string',
											minLength: 64,
											maxLength: 64,
											fieldNumber: 1,
										},
										signature: {
											type: 'string',
											minLength: 128,
											maxLength: 128,
											fieldNumber: 2,
										},
									},
								},
								minItems: 1,
								maxItems: 64,
							},
							optional: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										publicKey: {
											type: 'string',
											minLength: 64,
											maxLength: 64,
											fieldNumber: 3,
										},
										signature: {
											type: 'string',
											minLength: 0,
											maxLength: 128,
											fieldNumber: 4,
										},
									},
								},
								minItems: 0,
								maxItems: 64,
							},
						},
					},
					response: {
						$id: '/auth/sortMultisignatureGroupResponse',
						type: 'object',
						properties: {
							mandatoryKeys: {
								type: 'array',
								items: {
									dataType: 'bytes',
									minLength: 32,
									maxLength: 32,
								},
								fieldNumber: 1,
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
								fieldNumber: 2,
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
								fieldNumber: 3,
							},
						},
						required: [
							'mandatoryKeys',
							'optionalKeys',
							'signatures',
						],
					},
				},
				{
					name: 'getMultiSigRegMsgTag',
					response: {
						$id: '/auth/mutliSignatureRegistrationSignatureMessageTagResponse',
						type: 'object',
						properties: {
							tag: {
								type: 'string',
							},
						},
						required: [
							'tag',
						],
					},
				},
			],
			assets: [
				{
					version: 0,
					data: {
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
			],
			name: 'auth',
		},
		{
			commands: [],
			events: [
				{
					name: 'rewardMinted',
					data: {
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
			],
			stores: [
				{
					key: '054253ec0000',
					data: {
						$id: '/dynamicRewards/endOfRoundTimestamp',
						type: 'object',
						properties: {
							timestamp: {
								dataType: 'uint32',
								fieldNumber: 1,
							},
						},
						required: [
							'timestamp',
						],
					},
				},
			],
			endpoints: [
				{
					name: 'getDefaultRewardAtHeight',
					request: {
						$id: '/reward/endpoint/height',
						type: 'object',
						required: [
							'height',
						],
						properties: {
							height: {
								type: 'integer',
								format: 'uint32',
							},
						},
					},
					response: {
						$id: '/reward/endpoint/getDefaultRewardAtHeightResponse',
						type: 'object',
						required: [
							'reward',
						],
						properties: {
							reward: {
								type: 'string',
								format: 'uint64',
							},
						},
					},
				},
				{
					name: 'getAnnualInflation',
					request: {
						$id: '/reward/endpoint/height',
						type: 'object',
						required: [
							'height',
						],
						properties: {
							height: {
								type: 'integer',
								format: 'uint32',
							},
						},
					},
					response: {
						$id: '/reward/endpoint/getAnnualInflationResponse',
						type: 'object',
						required: [
							'tokenID',
							'rate',
						],
						properties: {
							tokenID: {
								type: 'string',
								format: 'hex',
							},
							rate: {
								type: 'string',
								format: 'uint64',
								minLength: 16,
								maxLength: 16,
							},
						},
					},
				},
				{
					name: 'getRewardTokenID',
					response: {
						$id: '/reward/endpoint/getRewardTokenID',
						type: 'object',
						required: [
							'tokenID',
						],
						properties: {
							tokenID: {
								type: 'string',
								format: 'hex',
								minLength: 16,
								maxLength: 16,
							},
						},
					},
				},
				{
					name: 'getExpectedValidatorRewards',
					request: {
						$id: 'modules/pos/endpoint/getExpectedSharedRewardsRequest',
						type: 'object',
						required: [
							'validatorAddress',
							'validatorReward',
							'stake',
						],
						properties: {
							validatorAddress: {
								type: 'string',
								format: 'lisk32',
							},
							validatorReward: {
								type: 'string',
								format: 'uint64',
							},
							stake: {
								type: 'string',
								format: 'uint64',
							},
						},
					},
					response: {
						$id: 'modules/pos/endpoint/getExpectedSharedRewardsResponse',
						type: 'object',
						required: [
							'reward',
						],
						properties: {
							reward: {
								type: 'string',
								format: 'uint64',
							},
						},
					},
				},
			],
			assets: [],
			name: 'dynamicReward',
		},
		{
			commands: [],
			events: [
				{
					name: 'generatorFeeProcessed',
					data: {
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
					name: 'relayerFeeProcessed',
					data: {
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
					name: 'insufficientFee',
					data: {
						$id: '/lisk/empty',
						type: 'object',
						properties: {},
					},
				},
			],
			stores: [],
			endpoints: [
				{
					name: 'getMinFeePerByte',
					response: {
						$id: '/fee/endpoint/getMinFeePerByteResponse',
						type: 'object',
						properties: {
							minFeePerByte: {
								type: 'integer',
								format: 'uint32',
							},
						},
						required: [
							'minFeePerByte',
						],
					},
				},
				{
					name: 'getFeeTokenID',
					response: {
						$id: '/fee/endpoint/getFeeTokenIDResponseSchema',
						type: 'object',
						properties: {
							feeTokenID: {
								type: 'string',
								format: 'hex',
							},
						},
						required: [
							'feeTokenID',
						],
					},
				},
			],
			assets: [],
			name: 'fee',
		},
		{
			commands: [
				{
					name: 'submitMainchainCrossChainUpdate',
					params: {
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
					name: 'initializeMessageRecovery',
					params: {
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
					name: 'recoverMessage',
					params: {
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
					name: 'registerSidechain',
					params: {
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
					name: 'recoverState',
					params: {
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
					name: 'terminateSidechainForLiveness',
					params: {
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
			],
			events: [
				{
					name: 'chainAccountUpdated',
					data: {
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
					name: 'ccmProcessed',
					data: {
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
					name: 'ccmSendSuccess',
					data: {
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
					name: 'ccmSentFailed',
					data: {
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
					name: 'invalidRegistrationSignature',
					data: {
						$id: '/lisk/empty',
						type: 'object',
						properties: {},
					},
				},
				{
					name: 'terminatedStateCreated',
					data: {
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
					name: 'terminatedOutboxCreated',
					data: {
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
					name: 'invalidSMTVerification',
					data: {
						$id: '/lisk/empty',
						type: 'object',
						properties: {},
					},
				},
				{
					name: 'invalidRMTVerification',
					data: {
						$id: '/lisk/empty',
						type: 'object',
						properties: {},
					},
				},
				{
					name: 'invalidCertificateSignature',
					data: {
						$id: '/lisk/empty',
						type: 'object',
						properties: {},
					},
				},
			],
			stores: [
				{
					key: '83ed0d250000',
					data: {
						$id: '/modules/interoperability/outbox',
						type: 'object',
						required: [
							'root',
						],
						properties: {
							root: {
								dataType: 'bytes',
								minLength: 32,
								maxLength: 32,
								fieldNumber: 1,
							},
						},
					},
				},
				{
					key: '83ed0d258000',
					data: {
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
					key: '83ed0d25b000',
					data: {
						$id: '/modules/interoperability/ownChainAccount',
						type: 'object',
						required: [
							'name',
							'chainID',
							'nonce',
						],
						properties: {
							name: {
								dataType: 'string',
								minLength: 1,
								maxLength: 32,
								fieldNumber: 1,
							},
							chainID: {
								dataType: 'bytes',
								minLength: 4,
								maxLength: 4,
								fieldNumber: 2,
							},
							nonce: {
								dataType: 'uint64',
								fieldNumber: 3,
							},
						},
					},
				},
				{
					key: '83ed0d25a000',
					data: {
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
					},
				},
				{
					key: '83ed0d259000',
					data: {
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
					},
				},
				{
					key: '83ed0d25c000',
					data: {
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
					key: '83ed0d25d000',
					data: {
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
					key: '83ed0d25e000',
					data: {
						$id: '/modules/interoperability/chainId',
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
			],
			endpoints: [
				{
					name: 'getChainAccount',
					request: {
						$id: '/modules/interoperability/endpoint/getChainAccountRequest',
						type: 'object',
						required: [
							'chainID',
						],
						properties: {
							chainID: {
								type: 'string',
								format: 'hex',
								minLength: 8,
								maxLength: 8,
							},
						},
					},
					response: {
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
					name: 'getAllChainAccounts',
					request: {
						$id: '/modules/interoperability/endpoint/getChainAccountRequest',
						type: 'object',
						required: [
							'chainID',
						],
						properties: {
							chainID: {
								type: 'string',
								format: 'hex',
								minLength: 8,
								maxLength: 8,
							},
						},
					},
					response: {
						$id: '/modules/interoperability/allChainAccounts',
						type: 'object',
						required: [
							'chains',
						],
						properties: {
							chains: {
								type: 'array',
								items: {
									type: 'object',
									required: [
										'name',
										'lastCertificate',
										'status',
									],
									properties: {
										name: {
											dataType: 'string',
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
													dataType: 'string',
													format: 'hex',
													fieldNumber: 3,
												},
												validatorsHash: {
													dataType: 'string',
													format: 'hex',
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
						},
					},
				},
				{
					name: 'getChannel',
					request: {
						$id: '/modules/interoperability/endpoint/getChainAccountRequest',
						type: 'object',
						required: [
							'chainID',
						],
						properties: {
							chainID: {
								type: 'string',
								format: 'hex',
								minLength: 8,
								maxLength: 8,
							},
						},
					},
					response: {
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
					},
				},
				{
					name: 'getOwnChainAccount',
					response: {
						$id: '/modules/interoperability/ownChainAccount',
						type: 'object',
						required: [
							'name',
							'chainID',
							'nonce',
						],
						properties: {
							name: {
								dataType: 'string',
								minLength: 1,
								maxLength: 32,
								fieldNumber: 1,
							},
							chainID: {
								dataType: 'bytes',
								minLength: 4,
								maxLength: 4,
								fieldNumber: 2,
							},
							nonce: {
								dataType: 'uint64',
								fieldNumber: 3,
							},
						},
					},
				},
				{
					name: 'getTerminatedStateAccount',
					request: {
						$id: '/modules/interoperability/endpoint/getChainAccountRequest',
						type: 'object',
						required: [
							'chainID',
						],
						properties: {
							chainID: {
								type: 'string',
								format: 'hex',
								minLength: 8,
								maxLength: 8,
							},
						},
					},
					response: {
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
					name: 'getTerminatedOutboxAccount',
					request: {
						$id: '/modules/interoperability/endpoint/getChainAccountRequest',
						type: 'object',
						required: [
							'chainID',
						],
						properties: {
							chainID: {
								type: 'string',
								format: 'hex',
								minLength: 8,
								maxLength: 8,
							},
						},
					},
					response: {
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
					name: 'getRegistrationFee',
					response: {
						$id: '/modules/interoperability/mainchain/registrationFee',
						type: 'object',
						required: [
							'registrationFee',
						],
						properties: {
							registrationFee: {
								type: 'string',
							},
						},
					},
				},
				{
					name: 'getMinimumMessageFee',
					response: {
						$id: '/modules/interoperability/mainchain/minimumMessageFeeResponse',
						type: 'object',
						required: [
							'fee',
						],
						properties: {
							fee: {
								type: 'string',
							},
						},
					},
				},
				{
					name: 'getChainValidators',
					request: {
						$id: '/modules/interoperability/endpoint/getChainAccountRequest',
						type: 'object',
						required: [
							'chainID',
						],
						properties: {
							chainID: {
								type: 'string',
								format: 'hex',
								minLength: 8,
								maxLength: 8,
							},
						},
					},
					response: {
						$id: '/modules/interoperability/validatorsHashInput',
						type: 'object',
						required: [
							'activeValidators',
							'certificateThreshold',
						],
						properties: {
							activeValidators: {
								type: 'array',
								fieldNumber: 1,
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
					},
				},
				{
					name: 'isChainIDAvailable',
					request: {
						$id: '/modules/interoperability/endpoint/getChainAccountRequest',
						type: 'object',
						required: [
							'chainID',
						],
						properties: {
							chainID: {
								type: 'string',
								format: 'hex',
								minLength: 8,
								maxLength: 8,
							},
						},
					},
					response: {
						$id: '/modules/interoperability/endpoint/isChainIDAvailableResponseSchema',
						type: 'object',
						required: [
							'result',
						],
						properties: {
							result: {
								type: 'boolean',
							},
						},
					},
				},
				{
					name: 'isChainNameAvailable',
					request: {
						$id: '/modules/interoperability/endpoint/isChainNameAvailableRequest',
						type: 'object',
						required: [
							'name',
						],
						properties: {
							name: {
								dataType: 'string',
								fieldNumber: 1,
								minLength: 1,
								maxLength: 32,
							},
						},
					},
					response: {
						$id: '/modules/interoperability/endpoint/isChainNameAvailableResponseSchema',
						type: 'object',
						required: [
							'result',
						],
						properties: {
							result: {
								type: 'boolean',
							},
						},
					},
				},
				{
					name: 'getCCMSchema',
					response: {
						$id: '/modules/interoperability/endpoint/getCCMSchemaResponseSchema',
						type: 'object',
						required: [
							'schema',
						],
						properties: {
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
					},
				},
			],
			assets: [
				{
					version: 0,
					data: {
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
			],
			name: 'interoperability',
		},
		{
			endpoints: [
				{
					name: 'getLegacyAccount',
					request: {
						$id: '/legacy/endpoint/legacyAccountRequest',
						type: 'object',
						required: [
							'publicKey',
						],
						properties: {
							publicKey: {
								type: 'string',
								format: 'hex',
							},
						},
					},
					response: {
						$id: '/legacy/store/genesis',
						type: 'object',
						required: [
							'balance',
						],
						properties: {
							balance: {
								dataType: 'uint64',
								fieldNumber: 1,
							},
						},
					},
				},
			],
			commands: [
				{
					name: 'reclaimLSK',
					params: {
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
					name: 'registerKeys',
					params: {
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
			],
			events: [
				{
					name: 'accountReclaimed',
					data: {
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
					name: 'keysRegistered',
					data: {
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
			],
			assets: [
				{
					version: 0,
					data: {
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
			],
			stores: [],
			name: 'legacy',
		},
		{
			commands: [
				{
					name: 'registerValidator',
					params: {
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
					name: 'reportMisbehavior',
					params: {
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
					name: 'unlock',
					params: {
						$id: '/lisk/empty',
						type: 'object',
						properties: {},
					},
				},
				{
					name: 'updateGeneratorKey',
					params: {
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
					name: 'stake',
					params: {
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
					name: 'changeCommission',
					params: {
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
					name: 'claimRewards',
					params: {
						$id: '/lisk/empty',
						type: 'object',
						properties: {},
					},
				},
			],
			events: [
				{
					name: 'validatorBanned',
					data: {
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
					name: 'validatorPunished',
					data: {
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
					name: 'validatorRegistered',
					data: {
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
					name: 'validatorStaked',
					data: {
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
					name: 'commissionChange',
					data: {
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
					name: 'rewardsAssigned',
					data: {
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
			],
			stores: [
				{
					key: '7160f8680000',
					data: {
						$id: '/pos/staker',
						type: 'object',
						required: [
							'stakes',
							'pendingUnlocks',
						],
						properties: {
							stakes: {
								type: 'array',
								fieldNumber: 1,
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
											fieldNumber: 1,
											format: 'lisk32',
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
														fieldNumber: 1,
														minLength: 8,
														maxLength: 8,
													},
													coefficient: {
														dataType: 'bytes',
														fieldNumber: 2,
														maxLength: 24,
													},
												},
											},
										},
									},
								},
							},
							pendingUnlocks: {
								type: 'array',
								fieldNumber: 2,
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
				{
					key: '7160f8688000',
					data: {
						$id: '/pos/validator',
						type: 'object',
						required: [
							'name',
							'totalStake',
							'selfStake',
							'lastGeneratedHeight',
							'isBanned',
							'reportMisbehaviorHeights',
							'consecutiveMissedBlocks',
							'commission',
							'lastCommissionIncreaseHeight',
							'sharingCoefficients',
						],
						properties: {
							name: {
								dataType: 'string',
								fieldNumber: 1,
							},
							totalStake: {
								dataType: 'uint64',
								fieldNumber: 2,
							},
							selfStake: {
								dataType: 'uint64',
								fieldNumber: 3,
							},
							lastGeneratedHeight: {
								dataType: 'uint32',
								fieldNumber: 4,
							},
							isBanned: {
								dataType: 'boolean',
								fieldNumber: 5,
							},
							reportMisbehaviorHeights: {
								type: 'array',
								fieldNumber: 6,
								items: {
									dataType: 'uint32',
								},
							},
							consecutiveMissedBlocks: {
								dataType: 'uint32',
								fieldNumber: 7,
							},
							commission: {
								dataType: 'uint32',
								fieldNumber: 8,
							},
							lastCommissionIncreaseHeight: {
								dataType: 'uint32',
								fieldNumber: 9,
							},
							sharingCoefficients: {
								type: 'array',
								fieldNumber: 10,
								items: {
									type: 'object',
									required: [
										'tokenID',
										'coefficient',
									],
									properties: {
										tokenID: {
											dataType: 'bytes',
											fieldNumber: 1,
											minLength: 8,
											maxLength: 8,
										},
										coefficient: {
											dataType: 'bytes',
											fieldNumber: 2,
											maxLength: 24,
										},
									},
								},
							},
						},
					},
				},
				{
					key: '7160f8684000',
					data: {
						$id: '/pos/name',
						type: 'object',
						required: [
							'validatorAddress',
						],
						properties: {
							validatorAddress: {
								dataType: 'bytes',
								fieldNumber: 1,
								format: 'lisk32',
							},
						},
					},
				},
				{
					key: '7160f868c000',
					data: {
						$id: '/pos/store/snapshot',
						type: 'object',
						required: [
							'validatorWeightSnapshot',
						],
						properties: {
							validatorWeightSnapshot: {
								type: 'array',
								fieldNumber: 1,
								items: {
									type: 'object',
									required: [
										'address',
										'weight',
									],
									properties: {
										address: {
											dataType: 'bytes',
											fieldNumber: 1,
											format: 'lisk32',
										},
										weight: {
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
					key: '7160f8682000',
					data: {
						$id: '/pos/store/genesis',
						type: 'object',
						required: [
							'height',
							'initRounds',
							'initValidators',
						],
						properties: {
							height: {
								dataType: 'uint32',
								fieldNumber: 1,
							},
							initRounds: {
								dataType: 'uint32',
								fieldNumber: 2,
							},
							initValidators: {
								type: 'array',
								fieldNumber: 3,
								items: {
									dataType: 'bytes',
									format: 'lisk32',
								},
							},
						},
					},
				},
				{
					key: '7160f868a000',
					data: {
						$id: '/pos/store/previousTimestamp',
						type: 'object',
						required: [
							'timestamp',
						],
						properties: {
							timestamp: {
								dataType: 'uint32',
								fieldNumber: 1,
							},
						},
					},
				},
				{
					key: '7160f8686000',
					data: {
						$id: '/pos/eligibleValidators',
						type: 'object',
						required: [
							'lastReportMisbehaviorHeight',
						],
						properties: {
							lastReportMisbehaviorHeight: {
								dataType: 'uint32',
								fieldNumber: 1,
							},
						},
					},
				},
			],
			endpoints: [
				{
					name: 'getAllValidators',
					response: {
						$id: 'modules/pos/endpoint/getAllValidatorsResponse',
						type: 'object',
						required: [
							'validators',
						],
						properties: {
							validators: {
								type: 'array',
								items: {
									type: 'object',
									required: [
										'address',
										'name',
										'totalStakeReceived',
										'selfStake',
										'lastGeneratedHeight',
										'isBanned',
										'pomHeights',
										'punishmentPeriods',
										'consecutiveMissedBlocks',
									],
									properties: {
										address: {
											type: 'string',
											format: 'lisk32',
										},
										name: {
											type: 'string',
										},
										totalStakeReceived: {
											type: 'string',
											format: 'uint64',
										},
										selfStake: {
											type: 'string',
											format: 'uint64',
										},
										lastGeneratedHeight: {
											type: 'integer',
											format: 'uint32',
										},
										isBanned: {
											type: 'boolean',
										},
										pomHeights: {
											type: 'array',
											items: {
												type: 'integer',
												format: 'uint32',
											},
										},
										punishmentPeriods: {
											type: 'array',
											items: {
												type: 'object',
												required: [
													'start',
													'end',
												],
												properties: {
													start: {
														type: 'integer',
														format: 'uint32',
													},
													end: {
														type: 'integer',
														format: 'uint32',
													},
												},
											},
										},
										consecutiveMissedBlocks: {
											type: 'integer',
											format: 'uint32',
										},
									},
								},
							},
						},
					},
				},
				{
					name: 'getValidator',
					request: {
						$id: 'modules/pos/endpoint/getValidatorRequest',
						type: 'object',
						required: [
							'address',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
						},
					},
					response: {
						$id: 'modules/pos/endpoint/getValidatorResponse',
						type: 'object',
						required: [
							'address',
							'name',
							'totalStakeReceived',
							'selfStake',
							'lastGeneratedHeight',
							'isBanned',
							'pomHeights',
							'punishmentPeriods',
							'consecutiveMissedBlocks',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
							name: {
								type: 'string',
							},
							totalStakeReceived: {
								type: 'string',
								format: 'uint64',
							},
							selfStake: {
								type: 'string',
								format: 'uint64',
							},
							lastGeneratedHeight: {
								type: 'integer',
								format: 'uint32',
							},
							isBanned: {
								type: 'boolean',
							},
							pomHeights: {
								type: 'array',
								items: {
									type: 'integer',
									format: 'uint32',
								},
							},
							punishmentPeriods: {
								type: 'array',
								items: {
									type: 'object',
									required: [
										'start',
										'end',
									],
									properties: {
										start: {
											type: 'integer',
											format: 'uint32',
										},
										end: {
											type: 'integer',
											format: 'uint32',
										},
									},
								},
							},
							consecutiveMissedBlocks: {
								type: 'integer',
								format: 'uint32',
							},
						},
					},
				},
				{
					name: 'getStaker',
					request: {
						$id: 'modules/pos/endpoint/getValidatorRequest',
						type: 'object',
						required: [
							'address',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
						},
					},
					response: {
						$id: 'modules/pos/endpoint/getStakerResponse',
						type: 'object',
						required: [
							'stakes',
							'pendingUnlocks',
						],
						properties: {
							stakes: {
								type: 'array',
								fieldNumber: 1,
								items: {
									type: 'object',
									required: [
										'validatorAddress',
										'amount',
									],
									properties: {
										validatorAddress: {
											type: 'string',
											format: 'lisk32',
										},
										amount: {
											type: 'string',
											format: 'uint64',
										},
									},
								},
							},
							pendingUnlocks: {
								type: 'array',
								fieldNumber: 2,
								items: {
									type: 'object',
									required: [
										'validatorAddress',
										'amount',
										'unstakeHeight',
									],
									properties: {
										validatorAddress: {
											type: 'string',
											format: 'lisk32',
										},
										amount: {
											type: 'string',
											format: 'uint64',
										},
										unstakeHeight: {
											type: 'integer',
											format: 'uint32',
										},
									},
								},
							},
						},
					},
				},
				{
					name: 'getConstants',
					response: {
						$id: '/pos/config',
						type: 'object',
						properties: {
							factorSelfStakes: {
								type: 'integer',
								format: 'uint32',
								minimum: 1,
							},
							maxLengthName: {
								type: 'integer',
								format: 'uint32',
								minimum: 10,
								maximum: 30,
							},
							maxNumberSentStakes: {
								type: 'integer',
								format: 'uint32',
								minimum: 1,
								maximum: 20,
							},
							maxNumberPendingUnlocks: {
								type: 'integer',
								format: 'uint32',
								minimum: 1,
								maximum: 40,
							},
							failSafeMissedBlocks: {
								type: 'integer',
								format: 'uint32',
								minimum: 2,
							},
							failSafeInactiveWindow: {
								type: 'integer',
								format: 'uint32',
								minimum: 43200,
								maximum: 3153600,
							},
							punishmentWindowSelfStaking: {
								type: 'integer',
								format: 'uint32',
								minimum: 43200,
								maximum: 3153600,
							},
							minWeightStandby: {
								type: 'string',
								format: 'uint64',
								minimum: 1,
							},
							numberActiveValidators: {
								type: 'integer',
								format: 'uint32',
								minimum: 1,
								maximum: 199,
							},
							numberStandbyValidators: {
								type: 'integer',
								format: 'uint32',
								maximum: 2,
							},
							posTokenID: {
								type: 'string',
								format: 'hex',
							},
							validatorRegistrationFee: {
								type: 'string',
								format: 'uint64',
							},
							maxBFTWeightCap: {
								type: 'integer',
								format: 'uint32',
								minimum: 300,
								maximum: 10000,
							},
							commissionIncreasePeriod: {
								type: 'integer',
								format: 'uint32',
							},
							maxCommissionIncreaseRate: {
								type: 'integer',
								format: 'uint32',
								minimum: 100,
								maximum: 10000,
							},
							useInvalidBLSKey: {
								type: 'boolean',
							},
							baseStakeAmount: {
								type: 'string',
								format: 'uint64',
								minimum: 1,
							},
							lockingPeriodStaking: {
								type: 'integer',
								format: 'uint32',
							},
							lockingPeriodSelfStaking: {
								type: 'integer',
								format: 'uint32',
							},
							reportMisbehaviorReward: {
								type: 'string',
								format: 'uint64',
							},
							reportMisbehaviorLimitBanned: {
								type: 'integer',
								format: 'uint32',
								minimum: 1,
							},
						},
						required: [
							'factorSelfStakes',
							'maxLengthName',
							'maxNumberSentStakes',
							'maxNumberPendingUnlocks',
							'failSafeMissedBlocks',
							'failSafeInactiveWindow',
							'punishmentWindowSelfStaking',
							'minWeightStandby',
							'numberActiveValidators',
							'numberStandbyValidators',
							'posTokenID',
							'validatorRegistrationFee',
							'maxBFTWeightCap',
							'useInvalidBLSKey',
							'baseStakeAmount',
							'lockingPeriodStaking',
							'lockingPeriodSelfStaking',
							'reportMisbehaviorReward',
							'reportMisbehaviorLimitBanned',
						],
					},
				},
				{
					name: 'getPoSTokenID',
					response: {
						$id: 'modules/pos/endpoint/getPoSTokenIDResponse',
						type: 'object',
						required: [
							'tokenID',
						],
						properties: {
							tokenID: {
								type: 'string',
								format: 'hex',
							},
						},
					},
				},
				{
					name: 'getClaimableRewards',
					request: {
						$id: 'modules/pos/endpoint/getClaimableRewardsRequest',
						type: 'object',
						required: [
							'address',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
						},
					},
					response: {
						$id: 'modules/pos/endpoint/getClaimableRewardsResponse',
						type: 'object',
						properties: {
							rewards: {
								items: {
									type: 'object',
									required: [
										'tokenID',
										'reward',
									],
									properties: {
										tokenID: {
											type: 'string',
											format: 'hex',
										},
										reward: {
											type: 'string',
											format: 'uint64',
										},
									},
								},
							},
						},
					},
				},
				{
					name: 'getLockedReward',
					request: {
						$id: 'modules/pos/endpoint/getLockedRewardRequest',
						type: 'object',
						required: [
							'address',
							'tokenID',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
							tokenID: {
								type: 'string',
								format: 'hex',
							},
						},
					},
					response: {
						$id: 'modules/pos/endpoint/getLockedRewardResponse',
						type: 'object',
						required: [
							'reward',
						],
						properties: {
							reward: {
								type: 'string',
								format: 'uint64',
							},
						},
					},
				},
				{
					name: 'getLockedStakedAmount',
					request: {
						$id: 'modules/pos/endpoint/getLockedStakedAmountRequest',
						type: 'object',
						required: [
							'address',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
						},
					},
					response: {
						$id: 'modules/pos/endpoint/getLockedStakedAmountResponse',
						type: 'object',
						required: [
							'amount',
						],
						properties: {
							amount: {
								type: 'string',
								format: 'uint64',
							},
						},
					},
				},
				{
					name: 'getValidatorsByStake',
					request: {
						$id: 'modules/pos/endpoint/getValidatorsByStakeRequest',
						type: 'object',
						properties: {
							limit: {
								type: 'integer',
								format: 'int32',
							},
						},
					},
					response: {
						$id: 'modules/pos/endpoint/getValidatorsByStakeResponse',
						type: 'object',
						required: [
							'validators',
						],
						properties: {
							validators: {
								type: 'array',
								items: {
									type: 'object',
									required: [
										'address',
										'name',
										'totalStakeReceived',
										'selfStake',
										'lastGeneratedHeight',
										'isBanned',
										'pomHeights',
										'punishmentPeriods',
										'consecutiveMissedBlocks',
									],
									properties: {
										address: {
											type: 'string',
											format: 'lisk32',
										},
										name: {
											type: 'string',
										},
										totalStakeReceived: {
											type: 'string',
											format: 'uint64',
										},
										selfStake: {
											type: 'string',
											format: 'uint64',
										},
										lastGeneratedHeight: {
											type: 'integer',
											format: 'uint32',
										},
										isBanned: {
											type: 'boolean',
										},
										pomHeights: {
											type: 'array',
											items: {
												type: 'integer',
												format: 'uint32',
											},
										},
										punishmentPeriods: {
											type: 'array',
											items: {
												type: 'object',
												required: [
													'start',
													'end',
												],
												properties: {
													start: {
														type: 'integer',
														format: 'uint32',
													},
													end: {
														type: 'integer',
														format: 'uint32',
													},
												},
											},
										},
										consecutiveMissedBlocks: {
											type: 'integer',
											format: 'uint32',
										},
									},
								},
							},
						},
					},
				},
				{
					name: 'getPendingUnlocks',
					request: {
						$id: 'modules/pos/endpoint/getPendingUnlocksRequest',
						type: 'object',
						required: [
							'address',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
						},
					},
					response: {
						$id: 'modules/pos/endpoint/getPendingUnlocksResponse',
						type: 'object',
						required: [
							'pendingUnlocks',
						],
						properties: {
							pendingUnlocks: {
								type: 'array',
								items: {
									type: 'object',
									required: [
										'validatorAddress',
										'amount',
										'unstakeHeight',
										'expectedUnlockableHeight',
										'unlockable',
									],
									properties: {
										validatorAddress: {
											type: 'string',
											format: 'lisk32',
										},
										amount: {
											type: 'string',
											format: 'uint64',
										},
										unstakeHeight: {
											type: 'integer',
											format: 'uint32',
										},
										expectedUnlockableHeight: {
											type: 'integer',
											format: 'uint32',
										},
										unlockable: {
											type: 'boolean',
										},
									},
								},
							},
						},
					},
				},
				{
					name: 'getRegistrationFee',
					response: {
						$id: 'modules/pos/endpoint/getRegistrationFeeResponse',
						type: 'object',
						required: [
							'registrationFee',
						],
						properties: {
							registrationFee: {
								type: 'string',
							},
						},
					},
				},
				{
					name: 'getExpectedSharedRewards',
					request: {
						$id: 'modules/pos/endpoint/getExpectedSharedRewardsRequest',
						type: 'object',
						required: [
							'validatorAddress',
							'validatorReward',
							'stake',
						],
						properties: {
							validatorAddress: {
								type: 'string',
								format: 'lisk32',
							},
							validatorReward: {
								type: 'string',
								format: 'uint64',
							},
							stake: {
								type: 'string',
								format: 'uint64',
							},
						},
					},
					response: {
						$id: 'modules/pos/endpoint/getExpectedSharedRewardsResponse',
						type: 'object',
						required: [
							'reward',
						],
						properties: {
							reward: {
								type: 'string',
								format: 'uint64',
							},
						},
					},
				},
			],
			assets: [
				{
					version: 0,
					data: {
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
			],
			name: 'pos',
		},
		{
			commands: [],
			events: [],
			stores: [
				{
					key: '2441b15f0000',
					data: {
						$id: '/modules/random/seedReveal',
						type: 'object',
						required: [
							'validatorReveals',
						],
						properties: {
							validatorReveals: {
								type: 'array',
								fieldNumber: 1,
								items: {
									type: 'object',
									required: [
										'generatorAddress',
										'seedReveal',
										'height',
										'valid',
									],
									properties: {
										generatorAddress: {
											dataType: 'bytes',
											minLength: 20,
											maxLength: 20,
											fieldNumber: 1,
										},
										seedReveal: {
											dataType: 'bytes',
											minLength: 16,
											maxLength: 16,
											fieldNumber: 2,
										},
										height: {
											dataType: 'uint32',
											fieldNumber: 3,
										},
										valid: {
											dataType: 'boolean',
											fieldNumber: 4,
										},
									},
								},
							},
						},
					},
				},
			],
			endpoints: [
				{
					name: 'isSeedRevealValid',
					request: {
						$id: '/modules/random/endpoint/isSeedRevealRequest',
						type: 'object',
						required: [
							'generatorAddress',
							'seedReveal',
						],
						properties: {
							generatorAddress: {
								type: 'string',
								format: 'lisk32',
							},
							seedReveal: {
								type: 'string',
								format: 'hex',
							},
						},
					},
					response: {
						$id: '/modules/random/endpoint/isSeedRevealResponse',
						type: 'object',
						required: [
							'valid',
						],
						properties: {
							valid: {
								type: 'boolean',
							},
						},
					},
				},
				{
					name: 'setHashOnion',
					request: {
						$id: 'lisk/random/setSeedRequestSchema',
						type: 'object',
						title: 'Random setSeed request',
						required: [
							'address',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
							seed: {
								type: 'string',
								format: 'hex',
								minLength: 32,
								maxLength: 32,
							},
							count: {
								type: 'integer',
								minimum: 1,
								maximum: 10000000,
							},
							distance: {
								type: 'integer',
								minimum: 1,
							},
							hashes: {
								type: 'array',
								minItems: 1,
								items: {
									type: 'string',
									format: 'hex',
									minLength: 32,
									maxLength: 32,
								},
							},
						},
					},
				},
				{
					name: 'getHashOnionSeeds',
					response: {
						$id: 'lisk/random/setSeedRequestSchema',
						type: 'object',
						title: 'Random setSeed request',
						required: [
							'address',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
							seed: {
								type: 'string',
								format: 'hex',
								minLength: 32,
								maxLength: 32,
							},
							count: {
								type: 'integer',
								minimum: 1,
								maximum: 10000000,
							},
							distance: {
								type: 'integer',
								minimum: 1,
							},
							hashes: {
								type: 'array',
								minItems: 1,
								items: {
									type: 'string',
									format: 'hex',
									minLength: 32,
									maxLength: 32,
								},
							},
						},
					},
				},
				{
					name: 'hasHashOnion',
					request: {
						$id: 'lisk/random/addressSchema',
						type: 'object',
						required: [
							'address',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
						},
					},
					response: {
						$id: 'lisk/random/hasHashOnionResponseSchema',
						type: 'object',
						required: [
							'hasSeed',
							'remaining',
						],
						properties: {
							hasSeed: {
								type: 'boolean',
							},
							remaining: {
								type: 'integer',
								format: 'uint32',
							},
						},
					},
				},
				{
					name: 'getHashOnionUsage',
					request: {
						$id: 'lisk/random/addressSchema',
						type: 'object',
						required: [
							'address',
						],
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
						},
					},
					response: {
						$id: 'lisk/random/getHashOnionUsageResponse',
						type: 'object',
						required: [
							'usedHashOnions',
							'seed',
						],
						properties: {
							usedHashOnions: {
								type: 'array',
								items: {
									type: 'object',
									required: [
										'count',
										'height',
									],
									properties: {
										count: {
											type: 'integer',
											format: 'uint32',
										},
										height: {
											type: 'integer',
											format: 'uint32',
										},
									},
								},
							},
							seed: {
								type: 'string',
								format: 'hex',
							},
						},
					},
				},
			],
			assets: [
				{
					version: 2,
					data: {
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
			],
			name: 'random',
		},
		{
			commands: [
				{
					name: 'transfer',
					params: {
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
					name: 'transferCrossChain',
					params: {
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
					name: 'transfer',
					data: {
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
					name: 'transferCrossChain',
					data: {
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
					name: 'ccmTransfer',
					data: {
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
					name: 'mint',
					data: {
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
					name: 'burn',
					data: {
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
					name: 'lock',
					data: {
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
					name: 'unlock',
					data: {
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
					name: 'initializeToken',
					data: {
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
					name: 'initializeUserAccount',
					data: {
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
					name: 'initializeEscrowAccount',
					data: {
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
					name: 'recover',
					data: {
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
					name: 'beforeCCCExecution',
					data: {
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
					name: 'beforeCCMForwarding',
					data: {
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
					name: 'allTokensSupported',
					data: {
						$id: '/lisk/empty',
						type: 'object',
						properties: {},
					},
				},
				{
					name: 'allTokensSupportRemoved',
					data: {
						$id: '/lisk/empty',
						type: 'object',
						properties: {},
					},
				},
				{
					name: 'allTokensFromChainSupported',
					data: {
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
					name: 'allTokensFromChainSupportRemoved',
					data: {
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
					name: 'tokenIDSupported',
					data: {
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
					name: 'tokenIDSupportRemoved',
					data: {
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
			],
			stores: [
				{
					key: '3c469e9d0000',
					data: {
						$id: '/token/store/user',
						type: 'object',
						required: [
							'availableBalance',
							'lockedBalances',
						],
						properties: {
							availableBalance: {
								dataType: 'uint64',
								fieldNumber: 1,
							},
							lockedBalances: {
								type: 'array',
								fieldNumber: 2,
								items: {
									type: 'object',
									required: [
										'module',
										'amount',
									],
									properties: {
										module: {
											dataType: 'string',
											fieldNumber: 1,
											minLength: 1,
											maxLength: 32,
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
				{
					key: '3c469e9d8000',
					data: {
						$id: '/token/store/supply',
						type: 'object',
						required: [
							'totalSupply',
						],
						properties: {
							totalSupply: {
								dataType: 'uint64',
								fieldNumber: 1,
							},
						},
					},
				},
				{
					key: '3c469e9d4000',
					data: {
						$id: '/token/store/escrow',
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
					key: '3c469e9dc000',
					data: {
						$id: '/token/store/supportedTokens',
						type: 'object',
						required: [
							'supportedTokenIDs',
						],
						properties: {
							supportedTokenIDs: {
								type: 'array',
								fieldNumber: 1,
								items: {
									dataType: 'bytes',
									minLength: 8,
									maxLength: 8,
								},
							},
						},
					},
				},
			],
			endpoints: [
				{
					name: 'getBalance',
					request: {
						$id: '/token/endpoint/getBalanceRequest',
						type: 'object',
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
							tokenID: {
								type: 'string',
								format: 'hex',
								minLength: 16,
								maxLength: 16,
							},
						},
						required: [
							'address',
							'tokenID',
						],
					},
					response: {
						$id: '/token/endpoint/getBalanceResponse',
						type: 'object',
						required: [
							'availableBalance',
							'lockedBalances',
						],
						properties: {
							availableBalance: {
								type: 'string',
								format: 'uint64',
							},
							lockedBalances: {
								type: 'array',
								items: {
									type: 'object',
									required: [
										'module',
										'amount',
									],
									properties: {
										module: {
											type: 'string',
										},
										amount: {
											type: 'string',
											format: 'uint64',
										},
									},
								},
							},
						},
					},
				},
				{
					name: 'getBalances',
					request: {
						$id: '/token/endpoint/getBalancesRequest',
						type: 'object',
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
						},
						required: [
							'address',
						],
					},
					response: {
						$id: '/token/endpoint/getBalancesResponse',
						type: 'object',
						required: [
							'balances',
						],
						properties: {
							balances: {
								type: 'array',
								items: {
									type: 'object',
									required: [
										'availableBalance',
										'lockedBalances',
										'tokenID',
									],
									properties: {
										tokenID: {
											type: 'string',
											format: 'hex',
										},
										availableBalance: {
											type: 'string',
											format: 'uint64',
										},
										lockedBalances: {
											type: 'array',
											items: {
												type: 'object',
												required: [
													'module',
													'amount',
												],
												properties: {
													module: {
														type: 'string',
													},
													amount: {
														type: 'string',
														format: 'uint64',
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
					name: 'getTotalSupply',
					response: {
						$id: '/token/endpoint/getTotalSupplyResponse',
						type: 'object',
						properties: {
							totalSupply: {
								type: 'array',
								items: {
									type: 'object',
									required: [
										'totalSupply',
										'tokenID',
									],
									properties: {
										tokenID: {
											type: 'string',
											format: 'hex',
										},
										totalSupply: {
											type: 'string',
											format: 'uint64',
										},
									},
								},
							},
						},
					},
				},
				{
					name: 'getSupportedTokens',
					response: {
						$id: '/token/endpoint/getSupportedTokensResponse',
						type: 'object',
						properties: {
							tokenIDs: {
								type: 'array',
								items: {
									type: 'string',
									format: 'hex',
								},
							},
						},
					},
				},
				{
					name: 'isSupported',
					request: {
						$id: '/token/endpoint/isSupportedRequest',
						type: 'object',
						properties: {
							tokenID: {
								type: 'string',
								format: 'hex',
								minLength: 16,
								maxLength: 16,
							},
						},
						required: [
							'tokenID',
						],
					},
					response: {
						$id: '/token/endpoint/isSupportedResponse',
						type: 'object',
						properties: {
							supported: {
								dataType: 'boolean',
							},
						},
						required: [
							'supported',
						],
					},
				},
				{
					name: 'getEscrowedAmounts',
					response: {
						$id: '/token/endpoint/getEscrowedAmountsResponse',
						type: 'object',
						properties: {
							escrowedAmounts: {
								type: 'array',
								items: {
									type: 'object',
									required: [
										'escrowChainID',
										'amount',
										'tokenID',
									],
									properties: {
										escrowChainID: {
											type: 'string',
											format: 'hex',
										},
										tokenID: {
											type: 'string',
											format: 'hex',
										},
										amount: {
											type: 'string',
											format: 'uint64',
										},
									},
								},
							},
						},
					},
				},
				{
					name: 'getInitializationFees',
					response: {
						$id: '/token/endpoint/getInitializationFees',
						type: 'object',
						properties: {
							userAccount: {
								type: 'string',
								format: 'uint64',
							},
							escrowAccount: {
								type: 'string',
								format: 'uint64',
							},
						},
						required: [
							'userAccount',
							'escrowAccount',
						],
					},
				},
				{
					name: 'hasUserAccount',
					request: {
						$id: '/token/endpoint/hasUserAccountRequest',
						type: 'object',
						properties: {
							address: {
								type: 'string',
								format: 'lisk32',
							},
							tokenID: {
								type: 'string',
								format: 'hex',
								minLength: 16,
								maxLength: 16,
							},
						},
						required: [
							'address',
							'tokenID',
						],
					},
					response: {
						$id: '/token/endpoint/hasUserAccountResponse',
						type: 'object',
						properties: {
							exists: {
								type: 'boolean',
							},
						},
					},
				},
				{
					name: 'hasEscrowAccount',
					request: {
						$id: '/token/endpoint/hasEscrowAccountRequest',
						type: 'object',
						properties: {
							tokenID: {
								type: 'string',
								format: 'hex',
								minLength: 16,
								maxLength: 16,
							},
							escrowChainID: {
								type: 'string',
								format: 'hex',
							},
						},
						required: [
							'tokenID',
							'escrowChainID',
						],
					},
					response: {
						$id: '/token/endpoint/hasEscrowAccountResponse',
						type: 'object',
						properties: {
							exists: {
								type: 'boolean',
							},
						},
					},
				},
			],
			assets: [
				{
					version: 0,
					data: {
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
			name: 'token',
		},
		{
			commands: [],
			events: [
				{
					name: 'generatorKeyRegistration',
					data: {
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
					name: 'blsKeyRegistration',
					data: {
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
			stores: [
				{
					key: '66d18af40000',
					data: {
						$id: '/validators/validatorAccountSubStore',
						title: 'Validators Account Keys',
						type: 'object',
						properties: {
							generatorKey: {
								dataType: 'bytes',
								fieldNumber: 1,
								minLength: 32,
								maxLength: 32,
							},
							blsKey: {
								dataType: 'bytes',
								fieldNumber: 2,
								minLength: 48,
								maxLength: 48,
							},
						},
						required: [
							'generatorKey',
							'blsKey',
						],
					},
				},
				{
					key: '66d18af48000',
					data: {
						$id: '/validators/validatorsParams',
						type: 'object',
						required: [
							'validators',
							'preCommitThreshold',
							'certificateThreshold',
						],
						properties: {
							preCommitThreshold: {
								fieldNumber: 1,
								dataType: 'uint64',
							},
							certificateThreshold: {
								fieldNumber: 2,
								dataType: 'uint64',
							},
							validators: {
								fieldNumber: 3,
								type: 'array',
								items: {
									type: 'object',
									required: [
										'address',
										'bftWeight',
										'generatorKey',
										'blsKey',
									],
									properties: {
										address: {
											fieldNumber: 1,
											dataType: 'bytes',
											format: 'lisk32',
										},
										bftWeight: {
											fieldNumber: 2,
											dataType: 'uint64',
										},
										generatorKey: {
											fieldNumber: 3,
											dataType: 'bytes',
										},
										blsKey: {
											fieldNumber: 4,
											dataType: 'bytes',
										},
									},
								},
							},
						},
					},
				},
				{
					key: '66d18af44000',
					data: {
						$id: '/validators/blsKeyData',
						title: 'Validators Addresses',
						type: 'object',
						properties: {
							address: {
								dataType: 'bytes',
								fieldNumber: 1,
							},
						},
						required: [
							'address',
						],
					},
				},
			],
			endpoints: [
				{
					name: 'validateBLSKey',
					request: {
						$id: '/validators/endpoint/validateBLSKeyRequest',
						title: 'Bls Key Properties',
						type: 'object',
						properties: {
							proofOfPossession: {
								type: 'string',
								format: 'hex',
							},
							blsKey: {
								type: 'string',
								format: 'hex',
							},
						},
						required: [
							'proofOfPossession',
							'blsKey',
						],
					},
					response: {
						$id: '/validators/endpoint/validateBLSKeyResponse',
						title: 'Bls Key Properties',
						type: 'object',
						properties: {
							valid: {
								type: 'boolean',
							},
						},
						required: [
							'valid',
						],
					},
				},
				{
					name: 'getValidator',
					request: {
						$id: '/validators/endpoint/getValidatorRequest',
						title: 'Validator properties',
						type: 'object',
						properties: {
							address: {
								dataType: 'string',
								format: 'lisk32',
							},
						},
						required: [
							'address',
						],
					},
					response: {
						$id: '/validators/endpoint/getValidatorResponse',
						title: 'Validator properties',
						type: 'object',
						properties: {
							generatorKey: {
								type: 'string',
								format: 'hex',
							},
							blsKey: {
								type: 'string',
								format: 'hex',
							},
						},
						required: [
							'generatorKey',
							'blsKey',
						],
					},
				},
			],
			assets: [],
			name: 'validators',
		},
	],
};

module.exports = {
	metadata,
};
