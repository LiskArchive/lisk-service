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
// TODO: Remove the file with Lisk SDK alpha.12,
// after SDK resolves issue: https://github.com/LiskHQ/lisk-sdk/issues/7993
const MAX_COMMISSION = 10000;
const TOKEN_ID_LENGTH = 8;
const MAX_NUMBER_BYTES_Q96 = 24;

const genesisPosStoreSchema = {
	$id: '/pos/module/genesis',
	type: 'object',
	required: ['validators', 'stakers', 'genesisData'],
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
					'pomHeights',
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
					pomHeights: {
						type: 'array',
						fieldNumber: 8,
						items: { dataType: 'uint32' },
					},
					consecutiveMissedBlocks: {
						dataType: 'uint32',
						fieldNumber: 9,
					},
					commission: {
						dataType: 'uint32',
						fieldNumber: 10,
						maximum: MAX_COMMISSION,
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
							required: ['tokenID', 'coefficient'],
							properties: {
								tokenID: {
									dataType: 'bytes',
									minLength: TOKEN_ID_LENGTH,
									maxLength: TOKEN_ID_LENGTH,
									fieldNumber: 1,
								},
								coefficient: {
									dataType: 'bytes',
									maxLength: MAX_NUMBER_BYTES_Q96,
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
				required: ['address', 'sentStakes', 'pendingUnlocks'],
				properties: {
					address: {
						dataType: 'bytes',
						format: 'lisk32',
						fieldNumber: 1,
					},
					sentStakes: {
						type: 'array',
						fieldNumber: 2,
						items: {
							type: 'object',
							required: ['validatorAddress', 'amount'],
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
								stakeSharingCoefficients: {
									type: 'array',
									fieldNumber: 3,
									items: {
										type: 'object',
										required: ['tokenID', 'coefficient'],
										properties: {
											tokenID: {
												dataType: 'bytes',
												minLength: TOKEN_ID_LENGTH,
												maxLength: TOKEN_ID_LENGTH,
												fieldNumber: 1,
											},
											coefficient: {
												dataType: 'bytes',
												maxLength: MAX_NUMBER_BYTES_Q96,
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
							required: ['validatorAddress', 'amount', 'unstakeHeight'],
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
			required: ['initRounds', 'initValidators'],
			properties: {
				initRounds: {
					dataType: 'uint32',
					fieldNumber: 1,
				},
				initValidators: {
					type: 'array',
					fieldNumber: 2,
					items: { dataType: 'bytes', format: 'lisk32' },
				},
			},
		},
	},
};

module.exports = {
	genesisPosStoreSchema,
};
