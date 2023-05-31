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
										'storeKey',
										'storeValue',
									],
									properties: {
										storeKey: {
											dataType: 'bytes',
											fieldNumber: 1,
										},
										storeValue: {
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
													},
												},
												optionalKeys: {
													type: 'array',
													fieldNumber: 4,
													items: {
														dataType: 'bytes',
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
	],
};

module.exports = {
	metadata,
};
