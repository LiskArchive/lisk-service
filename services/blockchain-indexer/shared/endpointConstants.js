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
const encryptedObjectSchema = {
	type: 'object',
	required: ['version', 'ciphertext', 'kdf', 'kdfparams', 'cipher', 'cipherparams'],
	properties: {
		version: {
			type: 'string',
		},
		ciphertext: {
			type: 'string',
			format: 'hex',
		},
		kdf: {
			type: 'string',
			enum: ['argon2id', 'PBKDF2'],
		},
		kdfparams: {
			type: 'object',
			properties: {
				parallelism: {
					type: 'integer',
				},
				iterations: {
					type: 'integer',
				},
				memoriSize: {
					type: 'integer',
				},
				salt: {
					type: 'string',
					format: 'hex',
				},
			},
		},
		cipher: {
			type: 'string',
			enum: ['aes-256-gcm'],
		},
		cipherparams: {
			type: 'object',
			properties: {
				iv: {
					type: 'string',
					format: 'hex',
				},
				tag: {
					type: 'string',
					format: 'hex',
				},
			},
		},
	},
};

const plainKeysObjectSchema = {
	type: 'object',
	required: ['generatorKey', 'generatorPrivateKey', 'blsKey', 'blsPrivateKey'],
	properties: {
		generatorKey: {
			type: 'string',
			format: 'hex',
			minLength: 64,
			maxLength: 64,
		},
		generatorPrivateKey: {
			type: 'string',
			format: 'hex',
			minLength: 128,
			maxLength: 128,
		},
		blsKey: {
			type: 'string',
			format: 'hex',
			minLength: 96,
			maxLength: 96,
		},
		blsPrivateKey: {
			type: 'string',
			format: 'hex',
			minLength: 64,
			maxLength: 64,
		},
	},
};

const engineBasedEndpoints = [
	{
		name: 'legacy_getBlockByID',
		request: {
			$id: '/lisk/legacy/getBlockByIDRequest',
			type: 'object',
			required: ['id'],
			properties: {
				id: {
					type: 'string',
					format: 'hex',
					minLength: 32,
					maxLength: 32,
				},
			},
		},
	},
	{
		name: 'legacy_getBlockByHeight',
		request: {
			$id: '/lisk/legacy/getBlockByHeightRequest',
			type: 'object',
			required: ['height'],
			properties: {
				height: {
					type: 'integer',
					minimum: 0,
				},
			},
		},
	},
	{
		name: 'chain_getBlockByID',
		request: {
			$id: '/lisk/chain/getBlockByIDRequest',
			type: 'object',
			required: ['id'],
			properties: {
				id: {
					type: 'string',
					format: 'hex',
					minLength: 32,
					maxLength: 32,
				},
			},
		},
	},
	{
		name: 'chain_getBlocksByIDs',
		request: {
			$id: '/lisk/chain/getBlocksByIDsRequest',
			type: 'object',
			required: ['ids'],
			properties: {
				ids: {
					type: 'array',
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
		name: 'chain_getBlockByHeight',
		request: {
			$id: '/lisk/chain/getBlockByHeightRequest',
			type: 'object',
			required: ['height'],
			properties: {
				height: {
					type: 'integer',
					minimum: 0,
				},
			},
		},
	},
	{
		name: 'chain_getBlocksByHeightBetween',
		request: {
			$id: '/lisk/chain/getBlocksByHeightBetweenRequest',
			type: 'object',
			required: ['from', 'to'],
			properties: {
				from: {
					type: 'integer',
					minimum: 0,
				},
				to: {
					type: 'integer',
					minimum: 0,
				},
			},
		},
	},
	{
		name: 'chain_getTransactionByID',
		request: {
			$id: '/lisk/chain/getTransactionByIDRequest',
			type: 'object',
			required: ['id'],
			properties: {
				id: {
					type: 'string',
					format: 'hex',
					minLength: 32,
					maxLength: 32,
				},
			},
		},
	},
	{
		name: 'chain_getTransactionsByIDs',
		request: {
			$id: '/lisk/chain/getTransactionsByIDsRequest',
			type: 'object',
			required: ['ids'],
			properties: {
				ids: {
					type: 'array',
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
		name: 'chain_getTransactionsByHeight',
		request: {
			$id: '/lisk/chain/getTransactionsByHeightRequest',
			type: 'object',
			required: ['height'],
			properties: {
				height: {
					type: 'integer',
					minimum: 0,
				},
			},
		},
	},
	{
		name: 'chain_getAssetsByHeight',
		request: {
			$id: '/lisk/chain/getAssetsByHeightRequest',
			type: 'object',
			required: ['height'],
			properties: {
				height: {
					type: 'integer',
					minimum: 0,
				},
			},
		},
	},
	{
		name: 'chain_getLastBlock',
		request: null,
	},
	{
		name: 'chain_getEvents',
		request: {
			$id: '/lisk/chain/getEventsRequest',
			type: 'object',
			required: ['height'],
			properties: {
				height: {
					type: 'integer',
					minimum: 0,
				},
			},
		},
	},
	{
		name: 'chain_proveEvents',
		request: {
			$id: '/node/endpoint/proveEventsRequestSchema',
			type: 'object',
			required: ['height', 'queries'],
			properties: {
				height: {
					type: 'integer',
					minimum: 0,
				},
				queries: {
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
		name: 'chain_getGeneratorList',
		request: null,
	},
	{
		name: 'chain_areHeadersContradicting',
		request: {
			$id: '/modules/bft/areHeadersContradictingRequest',
			type: 'object',
			required: ['header1', 'header2'],
			properties: {
				header1: { type: 'string', format: 'hex' },
				header2: { type: 'string', format: 'hex' },
			},
		},
	},
	{
		name: 'consensus_getBFTParameters',
		request: {
			$id: '/lisk/chain/getBFTParametersRequest',
			type: 'object',
			required: ['height'],
			properties: {
				height: {
					type: 'integer',
					minimum: 0,
				},
			},
		},
	},
	{
		name: 'consensus_getBFTHeights',
		request: null,
	},
	{
		name: 'state_prove',
		request: {
			$id: '/node/endpoint/stateProveRequestSchema',
			type: 'object',
			required: ['queryKeys'],
			properties: {
				queryKeys: {
					type: 'array',
					items: {
						dataType: 'string',
					},
				},
			},
		},
	},
	{
		name: 'system_getNodeInfo',
		request: null,
	},
	{
		name: 'system_getMetadata',
		request: null,
	},
	{
		name: 'system_getrequest',
		request: {},
	},
	{
		name: 'system_getMetricsReport',
		request: null,
	},
	{
		name: 'txpool_postTransaction',
		request: {
			$id: '/lisk/postTransaction',
			type: 'object',
			required: ['transaction'],
			properties: {
				transaction: {
					type: 'string',
					format: 'hex',
				},
			},
		},
	},
	{
		name: 'txpool_getTransactionsFromPool',
		request: null,
	},
	{
		name: 'txpool_dryRunTransaction',
		request: {
			$id: '/lisk/dryRunTransaction',
			type: 'object',
			required: ['transaction'],
			properties: {
				transaction: {
					type: 'string',
					format: 'hex',
				},
				skipVerify: {
					type: 'boolean',
					default: false,
				},
			},
		},
	},
	{
		name: 'generator_getStatus',
		request: null,
	},
	{
		name: 'generator_setStatus',
		request: {
			$id: '/lisk/setStatusRequest',
			type: 'object',
			required: ['address', 'height', 'maxHeightGenerated', 'maxHeightPrevoted'],
			properties: {
				address: {
					type: 'string',
					format: 'lisk32',
				},
				height: {
					type: 'integer',
					minimum: 0,
				},
				maxHeightGenerated: {
					type: 'integer',
					minimum: 0,
				},
				maxHeightPrevoted: {
					type: 'integer',
					minimum: 0,
				},
			},
		},
	},
	{
		name: 'generator_updateStatus',
		request: {
			$id: '/lisk/updateStatusRequest',
			type: 'object',
			required: ['address', 'password', 'enable', 'height', 'maxHeightGenerated', 'maxHeightPrevoted'],
			properties: {
				address: {
					type: 'string',
					format: 'lisk32',
				},
				password: {
					type: 'string',
				},
				enable: {
					type: 'boolean',
				},
				height: {
					type: 'integer',
				},
				maxHeightGenerated: {
					type: 'integer',
				},
				maxHeightPrevoted: {
					type: 'integer',
				},
			},
		},
	},
	{
		name: 'generator_estimateSafeStatus',
		request: {
			$id: '/generator/estimateSafeStatusRequest',
			type: 'object',
			required: ['timeShutdown'],
			properties: {
				timeShutdown: {
					type: 'integer',
				},
			},
		},
	},
	{
		name: 'generator_setKeys',
		request: {
			$id: '/generator/setKeysRequest',
			type: 'object',
			required: ['address', 'type', 'data'],
			properties: {
				address: {
					type: 'string',
					format: 'lisk32',
				},
			},
			oneOf: [
				{
					type: 'object',
					properties: {
						type: {
							const: 'plain',
						},
						data: plainKeysObjectSchema,
					},
				},
				{
					type: 'object',
					properties: {
						type: {
							const: 'encrypted',
						},
						data: encryptedObjectSchema,
					},
				},
			],
		},
	},
	{
		name: 'generator_getAllKeys',
		request: null,
	},
	{
		name: 'generator_hasKeys',
		request: {
			$id: '/generator/hasKeysRequest',
			type: 'object',
			required: ['address'],
			properties: {
				address: {
					type: 'string',
					format: 'lisk32',
				},
			},
		},
	},
	{
		name: 'network_getConnectedPeers',
		request: null,
	},
	{
		name: 'network_getDisconnectedPeers',
		request: null,
	},
	{
		name: 'network_getStats',
		request: null,
	},
];

module.exports = {
	engineBasedEndpoints,
};
