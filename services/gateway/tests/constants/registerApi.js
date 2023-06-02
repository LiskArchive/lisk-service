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
// TODO: Expected response for registerApi method should be dynamically constructed
const expectedResponseForRegisterHttpApi = [
	{
		whitelist: [
			'indexer.blocks.assets',
		],
		aliases: {
			'GET /': 'indexer.blocks.assets',
		},
		path: '/v3/blocks/assets',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.blockchain.apps',
		],
		aliases: {
			'GET /': 'indexer.blockchain.apps',
		},
		path: '/v3/blockchain/apps',
		etag: 'strong',
	},
	{
		whitelist: [
			'app-registry.blockchain.apps.meta.list',
		],
		aliases: {
			'GET /': 'app-registry.blockchain.apps.meta.list',
		},
		path: '/v3/blockchain/apps/meta/list',
		etag: 'strong',
	},
	{
		whitelist: [
			'app-registry.blockchain.apps.meta',
		],
		aliases: {
			'GET /': 'app-registry.blockchain.apps.meta',
		},
		path: '/v3/blockchain/apps/meta',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.blockchain.apps.statistics',
		],
		aliases: {
			'GET /': 'indexer.blockchain.apps.statistics',
		},
		path: '/v3/blockchain/apps/statistics',
		etag: 'strong',
	},
	{
		whitelist: [
			'app-registry.blockchain.apps.meta.tokens',
		],
		aliases: {
			'GET /': 'app-registry.blockchain.apps.meta.tokens',
		},
		path: '/v3/blockchain/apps/meta/tokens',
		etag: 'strong',
	},
	{
		whitelist: [
			'app-registry.blockchain.apps.meta.tokens.supported',
		],
		aliases: {
			'GET /': 'app-registry.blockchain.apps.meta.tokens.supported',
		},
		path: '/v3/blockchain/apps/meta/tokens/supported',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.blocks',
		],
		aliases: {
			'GET /': 'indexer.blocks',
		},
		path: '/v3/blocks',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.events',
		],
		aliases: {
			'GET /': 'indexer.events',
		},
		path: '/v3/events',
		etag: 'strong',
	},
	{
		whitelist: [
			'fees.estimates',
		],
		aliases: {
			'GET /': 'fees.estimates',
		},
		path: '/v3/fees',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.generators',
		],
		aliases: {
			'GET /': 'indexer.generators',
		},
		path: '/v3/generators',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.index.status',
		],
		aliases: {
			'GET /': 'indexer.index.status',
		},
		path: '/v3/index/status',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.invokeEndpoint',
		],
		aliases: {
			'POST /': 'indexer.invokeEndpoint',
		},
		path: '/v3/invoke',
		etag: 'strong',
	},
	{
		whitelist: [
			'market.prices',
		],
		aliases: {
			'GET /': 'market.prices',
		},
		path: '/v3/market/prices',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.network.peers',
		],
		aliases: {
			'GET /': 'indexer.network.peers',
		},
		path: '/v3/network/peers',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.network.statistics',
		],
		aliases: {
			'GET /': 'indexer.network.statistics',
		},
		path: '/v3/network/statistics',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.network.status',
		],
		aliases: {
			'GET /': 'indexer.network.status',
		},
		path: '/v3/network/status',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.transactions.post',
		],
		aliases: {
			'POST /': 'indexer.transactions.post',
		},
		path: '/v3/transactions',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.schemas',
		],
		aliases: {
			'GET /': 'indexer.schemas',
		},
		path: '/v3/schemas',
		etag: 'strong',
	},
	{
		whitelist: [
			'gateway.spec',
		],
		aliases: {
			'GET /': 'gateway.spec',
		},
		path: '/v3/spec',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.transactions',
		],
		aliases: {
			'GET /': 'indexer.transactions',
		},
		path: '/v3/transactions',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.transactions.dryrun',
		],
		aliases: {
			'POST /': 'indexer.transactions.dryrun',
		},
		path: '/v3/transactions/dryrun',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.transactions.estimate-fees',
		],
		aliases: {
			'POST /': 'indexer.transactions.estimate-fees',
		},
		path: '/v3/transactions/estimate-fees',
		etag: 'strong',
	},
	{
		whitelist: [
			'statistics.transactions.statistics',
		],
		aliases: {
			'GET /': 'statistics.transactions.statistics',
		},
		path: '/v3/transactions/statistics',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.legacy',
		],
		aliases: {
			'GET /': 'indexer.legacy',
		},
		path: '/v3/legacy',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.pos.rewards.claimable',
		],
		aliases: {
			'GET /': 'indexer.pos.rewards.claimable',
		},
		path: '/v3/pos/rewards/claimable',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.pos.constants',
		],
		aliases: {
			'GET /': 'indexer.pos.constants',
		},
		path: '/v3/pos/constants',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.pos.rewards.locked',
		],
		aliases: {
			'GET /': 'indexer.pos.rewards.locked',
		},
		path: '/v3/pos/rewards/locked',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.pos.stakers',
		],
		aliases: {
			'GET /': 'indexer.pos.stakers',
		},
		path: '/v3/pos/stakers',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.pos.stakes',
		],
		aliases: {
			'GET /': 'indexer.pos.stakes',
		},
		path: '/v3/pos/stakes',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.pos.unlocks',
		],
		aliases: {
			'GET /': 'indexer.pos.unlocks',
		},
		path: '/v3/pos/unlocks',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.pos.validators',
		],
		aliases: {
			'GET /': 'indexer.pos.validators',
		},
		path: '/v3/pos/validators',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.token.account.exists',
		],
		aliases: {
			'GET /': 'indexer.token.account.exists',
		},
		path: '/v3/token/account/exists',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.token.available-ids',
		],
		aliases: {
			'GET /': 'indexer.token.available-ids',
		},
		path: '/v3/token/available-ids',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.token.constants',
		],
		aliases: {
			'GET /': 'indexer.token.constants',
		},
		path: '/v3/token/constants',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.token.summary',
		],
		aliases: {
			'GET /': 'indexer.token.summary',
		},
		path: '/v3/token/summary',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.token.balances.top',
		],
		aliases: {
			'GET /': 'indexer.token.balances.top',
		},
		path: '/v3/token/balances/top',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.validator',
		],
		aliases: {
			'GET /': 'indexer.validator',
		},
		path: '/v3/validator',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.validateBLSKey',
		],
		aliases: {
			'POST /': 'indexer.validateBLSKey',
		},
		path: '/v3/validator/validate-bls-key',
		etag: 'strong',
	},
	{
		whitelist: [
			'export.transactions.csv',
		],
		aliases: {
			'GET /': 'export.transactions.csv',
		},
		path: '/v3/export/download',
		etag: 'strong',
	},
	{
		whitelist: [
			'export.transactions.schedule',
		],
		aliases: {
			'GET /': 'export.transactions.schedule',
		},
		path: '/v3/export/transactions',
		etag: 'strong',
	},
	{
		whitelist: [
			'indexer.token.balances',
		],
		aliases: {
			'GET /': 'indexer.token.balances',
		},
		path: '/v3/token/balances',
		etag: false,
	},
];

// TODO: Expected response for registerApi method should be dynamically constructed
const expectedResponseForRegisterRpcApi = {
	events: {
		request: {
			whitelist: [
				'indexer.blocks.assets',
				'indexer.blockchain.apps',
				'app-registry.blockchain.apps.meta.list',
				'app-registry.blockchain.apps.meta',
				'indexer.blockchain.apps.statistics',
				'app-registry.blockchain.apps.meta.tokens',
				'app-registry.blockchain.apps.meta.tokens.supported',
				'indexer.blocks',
				'indexer.events',
				'fees.estimates',
				'indexer.generators',
				'indexer.index.status',
				'indexer.invokeEndpoint',
				'market.prices',
				'indexer.network.peers',
				'indexer.network.statistics',
				'indexer.network.status',
				'indexer.transactions.post',
				'indexer.schemas',
				'indexer.transactions',
				'indexer.transactions.dryrun',
				'indexer.transactions.estimate-fees',
				'statistics.transactions.statistics',
				'indexer.legacy',
				'indexer.pos.rewards.claimable',
				'indexer.pos.constants',
				'indexer.pos.rewards.locked',
				'indexer.pos.stakers',
				'indexer.pos.stakes',
				'indexer.pos.unlocks',
				'indexer.pos.validators',
				'indexer.token.account.exists',
				'indexer.token.available-ids',
				'indexer.token.balances',
				'indexer.token.constants',
				'indexer.token.summary',
				'indexer.token.balances.top',
				'indexer.validator',
				'indexer.validateBLSKey',
				'export.transactions.schedule',
			],
			aliases: {
				'get.blocks.assets': 'indexer.blocks.assets',
				'get.blockchain.apps': 'indexer.blockchain.apps',
				'get.blockchain.apps.meta.list': 'app-registry.blockchain.apps.meta.list',
				'get.blockchain.apps.meta': 'app-registry.blockchain.apps.meta',
				'get.blockchain.apps.statistics': 'indexer.blockchain.apps.statistics',
				'get.blockchain.apps.meta.tokens': 'app-registry.blockchain.apps.meta.tokens',
				'get.blockchain.apps.meta.tokens.supported': 'app-registry.blockchain.apps.meta.tokens.supported',
				'get.blocks': 'indexer.blocks',
				'get.events': 'indexer.events',
				'get.fees': 'fees.estimates',
				'get.generators': 'indexer.generators',
				'get.index.status': 'indexer.index.status',
				'post.invoke': 'indexer.invokeEndpoint',
				'get.market.prices': 'market.prices',
				'get.network.peers': 'indexer.network.peers',
				'get.network.statistics': 'indexer.network.statistics',
				'get.network.status': 'indexer.network.status',
				'post.transactions': 'indexer.transactions.post',
				'get.schemas': 'indexer.schemas',
				'get.transactions': 'indexer.transactions',
				'post.transactions.estimate-fees': 'indexer.transactions.estimate-fees',
				'post.transactions.dryrun': 'indexer.transactions.dryrun',
				'get.transactions.statistics': 'statistics.transactions.statistics',
				'get.legacy': 'indexer.legacy',
				'get.pos.rewards.claimable': 'indexer.pos.rewards.claimable',
				'get.pos.constants': 'indexer.pos.constants',
				'get.pos.rewards.locked': 'indexer.pos.rewards.locked',
				'get.pos.stakers': 'indexer.pos.stakers',
				'get.pos.stakes': 'indexer.pos.stakes',
				'get.pos.unlocks': 'indexer.pos.unlocks',
				'get.pos.validators': 'indexer.pos.validators',
				'get.token.account.exists': 'indexer.token.account.exists',
				'get.token.balances': 'indexer.token.balances',
				'get.token.balances.top': 'indexer.token.balances.top',
				'get.token.constants': 'indexer.token.constants',
				'get.token.available-ids': 'indexer.token.available-ids',
				'get.token.summary': 'indexer.token.summary',
				'get.validator': 'indexer.validator',
				'post.validator.validate-bls-key': 'indexer.validateBLSKey',
				'get.export.transactions': 'export.transactions.schedule',
			},
			mappingPolicy: 'restrict',
		},
	},
};

const methodDefForTransformResponse = {
	source: {
		definition: {
			data: [
				'data',
				{
					chainID: '=,string',
					chainName: '=,string',
					tokenID: '=,string',
					tokenName: '=,string',
					networkType: 'network,string',
					description: '=,string',
					logo: {
						png: '=,string',
						svg: '=,string',
					},
					symbol: '=,string',
					displayDenom: '=,string',
					baseDenom: '=,string',
					denomUnits: [
						'denomUnits',
						{
							denom: '=,string',
							decimals: '=,number',
							aliases: '=',
						},
					],
					customNumber: 'otherName,number', // Should use value of otherName key and covert to number
				},
			],
			meta: {
				count: '=,number',
				offset: '=,number',
				total: '=,number',
			},
			links: {},
		},
	},
	data: [],
	meta: {},
};

const dataForTransformResponse = {
	data: [
		{
			tokenID: '0300000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/Artboard%201%20copy%2019.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/Logo-20.svg',
			},
			chainID: '03000000',
			chainName: 'Lisk',
			network: 'alphanet',
			otherName: '123',
		},
		{
			tokenID: '0400000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/Artboard%201%20copy%2019.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/Logo-20.svg',
			},
			chainID: '04000000',
			chainName: 'Lisk',
			network: 'devnet',
			otherName: '456',
		},
	],
	meta: {
		count: 2,
		offset: 0,
		total: 5,
	},
};

const expectedResponseForTransformResponse = {
	data: [
		{
			chainID: '03000000',
			chainName: 'Lisk',
			tokenID: '0300000000000000',
			tokenName: 'Lisk',
			networkType: 'alphanet',
			description: 'Default token for the entire Lisk ecosystem',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/Artboard%201%20copy%2019.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/Logo-20.svg',
			},
			symbol: 'LSK',
			displayDenom: 'lsk',
			baseDenom: 'beddows',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			customNumber: 123,
		},
		{
			chainID: '04000000',
			chainName: 'Lisk',
			tokenID: '0400000000000000',
			tokenName: 'Lisk',
			networkType: 'devnet',
			description: 'Default token for the entire Lisk ecosystem',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/Artboard%201%20copy%2019.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/Logo-20.svg',
			},
			symbol: 'LSK',
			displayDenom: 'lsk',
			baseDenom: 'beddows',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			customNumber: 456,
		},
	],
	meta: {
		count: 2,
		offset: 0,
		total: 5,
	},
};

const paramsForTransformRequest = {
	tokenName: 'Lisk,Lis,Lik',
	tokenIDParam: '0300000000000000,0400000000000000',
	network: 'devnet,alphanet',
	limit: 10,
	offset: 0,
	sort: 'chainName:asc',
};

const methodDefForTransformRequest = {
	source: {
		params: {
			chainName: '=,string',
			chainID: '=,string',
			tokenName: '=,string',
			tokenID: 'tokenIDParam,string', // Should fetch value from tokenIDParam and map with tokenID key
			network: '=,string',
			search: '=,string',
			offset: '=,number',
			limit: '=,number',
			sort: '=,string',
		},
	},
};

const expectedResponseForTransformRequest = {
	chainID: undefined,
	chainName: undefined,
	limit: 10,
	network: 'devnet,alphanet',
	offset: 0,
	search: undefined,
	sort: 'chainName:asc',
	tokenID: '0300000000000000,0400000000000000',
	tokenName: 'Lisk,Lis,Lik',
};

const sourceForMapParamWithType = {
	key_str: 'val_str',
	key_bool: true,
	key_number: 123,
};

const paramsForTransformParams = {
	key_str: 'val_str',
	key_bool: true,
	key_number: 123,
	obj: { key: 'value' },
	arr: [1, 2, 3],
};

const specsForTransformParams = {
	new_key_str: 'key_str, string',
	key_bool: '=,boolean',
	str_from_number: 'key_number,string',
	obj: '=',
	arr: '=',
};

const expectedResponseForTransformParams = {
	new_key_str: 'val_str',
	key_bool: true,
	str_from_number: '123',
	obj: { key: 'value' },
	arr: [1, 2, 3],
};

const sourceForMapParam = {
	originalKey: 'originalValue',
	mappingKey: 'mappingValue',
};

const buildAPIAliasesPrefix = '/test';
const buildAPIAliasesMethods = {
	errorServer: {
		version: '2.0',
		swaggerApiPath: '/server_error',
		rpcMethod: 'get.server_error',
		envelope: {},
		source: {
			type: 'moleculer',
			method: 'template.server.error',
			params: {},
			definition: {
				error: '=,string',
				status: '=,number',
			},
		},
	},
	helloGeneric: {
		version: '2.0',
		swaggerApiPath: '/hello',
		rpcMethod: 'get.hello',
		envelope: {
			data: [],
			meta: {},
			links: {},
		},
		source: {
			type: 'moleculer',
			method: 'template.generic.hello',
			params: {},
			definition: {
				data: [
					'data',
					{
						message: '=',
						name: '=',
					},
				],
				meta: {
					count: 'meta.count,number',
					offset: '=,number',
					total: 'meta.total,number',
				},
				links: {},
			},
		},
	},
};

const buildAPIAliasesResponse = {
	aliases: {
		'GET /': 'template.generic.hello',
	},
	whitelist: [
		'template.server.error',
		'template.generic.hello',
	],
	methodPaths: {
		'GET ': {
			version: '2.0',
			swaggerApiPath: '/hello',
			rpcMethod: 'get.hello',
			envelope: {
				data: [],
				meta: {},
				links: {},
			},
			source: {
				type: 'moleculer',
				method: 'template.generic.hello',
				params: {},
				definition: {
					data: [
						'data',
						{
							message: '=',
							name: '=',
						},
					],
					meta: {
						count: 'meta.count,number',
						offset: '=,number',
						total: 'meta.total,number',
					},
					links: {},
				},
			},
		},
	},
};

const buildAPIAliasesPrefixWithFalseEtag = '/v3';
const buildAPIAliasesMethodsWithFalseEtag = {
	key: {
		version: '2.0',
		swaggerApiPath: '/token/balances',
		rpcMethod: 'get.token.balances',
		tags: [
			'Token',
		],
		etag: false,
		params: {
			address: {
				optional: false,
				type: 'string',
				pattern: {},
			},
			tokenID: {
				optional: true,
				type: 'string',
				pattern: {},
			},
			limit: {
				optional: true,
				type: 'number',
				min: 1,
				max: 100,
				default: 10,
			},
			offset: {
				optional: true,
				type: 'number',
				min: 0,
				default: 0,
			},
		},
		schema: {
			'/token/balances': {
				get: {
					tags: [
						'Token',
					],
					summary: 'Requests tokens information',
					description: 'Returns tokens information\n RPC => get.token.balances',
					parameters: [
						{
							$ref: '#/parameters/address',
						},
						{
							$ref: '#/parameters/tokenID',
						},
						{
							$ref: '#/parameters/limit',
						},
						{
							$ref: '#/parameters/offset',
						},
					],
					responses: {
						200: {
							description: 'Returns a list of supported tokens by the blockchain application',
							schema: {
								$ref: '#/definitions/tokenWithEnvelope',
							},
						},
						400: {
							description: 'Bad request',
							schema: {
								$ref: '#/definitions/badRequest',
							},
						},
					},
				},
			},
		},
		source: {
			type: 'moleculer',
			method: 'indexer.token.balances',
			params: {
				address: '=,string',
				tokenID: '=,string',
				offset: '=,number',
				limit: '=,number',
			},
			definition: {
				data: [
					'data',
					{
						tokenID: '=,string',
						availableBalance: '=,string',
						lockedBalances: [
							'lockedBalances',
							{
								module: '=,string',
								amount: '=,string',
							},
						],
					},
				],
				meta: {
					address: '=,string',
					count: '=,number',
					offset: '=,number',
					total: '=,number',
				},
				links: {},
			},
		},
		envelope: {
			data: [],
			meta: {},
		},
	},
};

const buildAPIAliasesWithFalseEtagResponse = {
	aliases: {
		'GET /': 'indexer.token.balances',
	},
	whitelist: [
		'indexer.token.balances',
	],
	methodPaths: {
		'GET ': {
			version: '2.0',
			swaggerApiPath: '/token/balances',
			rpcMethod: 'get.token.balances',
			tags: [
				'Token',
			],
			etag: false,
			params: {
				address: {
					optional: false,
					type: 'string',
					pattern: {},
				},
				tokenID: {
					optional: true,
					type: 'string',
					pattern: {},
				},
				limit: {
					optional: true,
					type: 'number',
					min: 1,
					max: 100,
					default: 10,
				},
				offset: {
					optional: true,
					type: 'number',
					min: 0,
					default: 0,
				},
			},
			schema: {
				'/token/balances': {
					get: {
						tags: [
							'Token',
						],
						summary: 'Requests tokens information',
						description: 'Returns tokens information\n RPC => get.token.balances',
						parameters: [
							{
								$ref: '#/parameters/address',
							},
							{
								$ref: '#/parameters/tokenID',
							},
							{
								$ref: '#/parameters/limit',
							},
							{
								$ref: '#/parameters/offset',
							},
						],
						responses: {
							200: {
								description: 'Returns a list of supported tokens by the blockchain application',
								schema: {
									$ref: '#/definitions/tokenWithEnvelope',
								},
							},
							400: {
								description: 'Bad request',
								schema: {
									$ref: '#/definitions/badRequest',
								},
							},
						},
					},
				},
			},
			source: {
				type: 'moleculer',
				method: 'indexer.token.balances',
				params: {
					address: '=,string',
					tokenID: '=,string',
					offset: '=,number',
					limit: '=,number',
				},
				definition: {
					data: [
						'data',
						{
							tokenID: '=,string',
							availableBalance: '=,string',
							lockedBalances: [
								'lockedBalances',
								{
									module: '=,string',
									amount: '=,string',
								},
							],
						},
					],
					meta: {
						address: '=,string',
						count: '=,number',
						offset: '=,number',
						total: '=,number',
					},
					links: {},
				},
			},
			envelope: {
				data: [],
				meta: {},
			},
		},
	},
};

const getAllAPIsExpectedResponse = {
	ready: {
		envelope: {},
		rpcMethod: 'get.ready',
		source: {
			definition: {
				services: '=',
			},
			method: 'gateway.ready',
			params: {},
			type: 'moleculer',
		},
		swaggerApiPath: '/ready',
		version: '2.0',
	},
	status: {
		envelope: {},
		rpcMethod: 'get.status',
		source: {
			definition: {
				build: '=',
				chainID: '=',
				description: '=',
				name: '=',
				networkNodeVersion: '=',
				version: '=',
			},
			method: 'gateway.status',
			params: {},
			type: 'moleculer',
		},
		swaggerApiPath: '/status',
		version: '2.0',
	},
};

module.exports = {
	expectedResponseForRegisterHttpApi,
	expectedResponseForRegisterRpcApi,

	methodDefForTransformResponse,
	dataForTransformResponse,
	expectedResponseForTransformResponse,

	paramsForTransformRequest,
	methodDefForTransformRequest,
	expectedResponseForTransformRequest,

	sourceForMapParamWithType,

	paramsForTransformParams,
	specsForTransformParams,
	expectedResponseForTransformParams,

	sourceForMapParam,

	buildAPIAliasesPrefix,
	buildAPIAliasesMethods,
	buildAPIAliasesResponse,

	buildAPIAliasesPrefixWithFalseEtag,
	buildAPIAliasesMethodsWithFalseEtag,
	buildAPIAliasesWithFalseEtagResponse,

	getAllAPIsExpectedResponse,
};
