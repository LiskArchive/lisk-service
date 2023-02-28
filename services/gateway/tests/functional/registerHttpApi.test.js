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
const {
	mapParamWithType,
	transformParams,
	transformRequest,
	transformResponse,
	registerApi,
	transformPath,
} = require('../../shared/registerHttpApi');

describe('Test transformPath method', () => {
	it('should return converted string when called with a string having curly braces and `/` in beginning', async () => {
		const response = transformPath('//url/{param1}/{param2}');
		expect(response).toEqual('/url/:param1/:param2');
	});

	it('should return converted string when called with a string having curly braces', async () => {
		const response = transformPath('url/{param1}/{param2}');
		expect(response).toEqual('url/:param1/:param2');
	});

	it('should return original string when called with a string which does not have curly braces', async () => {
		const response = transformPath('url/param1/param2');
		expect(response).toEqual('url/param1/param2');
	});

	it('should return empty string when called with empty string', async () => {
		const response = transformPath('');
		expect(response).toEqual('');
	});

	it('should throw when called with null', async () => {
		expect(() => transformPath(null)).toThrow();
	});

	it('should throw when called with undefined', async () => {
		expect(() => transformPath(undefined)).toThrow();
	});
});

describe('Test mapParamWithType method', () => {
	const source = {
		key_str: 'val_str',
		key_bool: true,
		key_number: 123,
	};

	it('should return mapped value when called with valid params', async () => {
		const originalSetup = 'key_number';
		const response = mapParamWithType(source, originalSetup, 'new_key');
		expect(response).toEqual({
			key: 'new_key',
			value: source[originalSetup],
		});
	});

	it('should returns converted & mapped value when called with type string', async () => {
		const originalSetup = 'key_number';
		const response = mapParamWithType(source, `${originalSetup},string`, 'new_key');
		expect(response).toEqual({
			key: 'new_key',
			value: String(source[originalSetup]),
		});
	});

	it('should throw error when source is null or undefined', async () => {
		const originalSetup = 'key_number';
		expect(() => mapParamWithType(null, originalSetup, 'new_key')).toThrow();
		expect(() => mapParamWithType(undefined, originalSetup, 'new_key')).toThrow();
	});

	it('should return throw error when originalSetup is null or undefined', async () => {
		expect(() => mapParamWithType(source, null, 'new_key')).toThrow();
		expect(() => mapParamWithType(source, undefined, 'new_key')).toThrow();
	});

	it('should return undefined value when mappingKey is null or undefined', async () => {
		const originalSetup = 'key_number';
		// Null
		const response = mapParamWithType(source, originalSetup, null);
		expect(response).toEqual({});

		// Undefined
		const response2 = mapParamWithType(source, originalSetup, undefined);
		expect(response2).toEqual({});
	});
});

describe('Test transformParams method', () => {
	const params = {
		key_str: 'val_str',
		key_bool: true,
		key_number: 123,
		obj: { key: 'value' },
		arr: [1, 2, 3],
	};

	const specs = {
		new_key_str: 'key_str, string',
		key_bool: '=,boolean',
		str_from_number: 'key_number,string',
		obj: '=',
		arr: '=',
	};

	it('should return mapped object when called with valid params', async () => {
		const response = transformParams(params, specs);
		expect(response).toEqual({
			new_key_str: 'val_str',
			key_bool: true,
			str_from_number: '123',
			obj: { key: 'value' },
			arr: [1, 2, 3],
		});
	});

	it('should throw error when called with null params', async () => {
		expect(() => transformParams(null, specs)).toThrow();
	});

	it('should return mapped object when called with undefined params', async () => {
		const response = transformParams(undefined, specs);
		expect(response).toEqual({
			new_key_str: undefined,
			key_bool: undefined,
			str_from_number: undefined,
			obj: undefined,
			arr: undefined,
		});
	});

	it('should throw error when called with null specs', async () => {
		expect(() => transformParams(params, null)).toThrow();
	});

	it('should throw error object when called with undefined specs', async () => {
		expect(() => transformParams(params, undefined)).toThrow();
	});
});

describe('Test transformRequest method', () => {
	const params = {
		tokenName: 'Lisk,Lis,Lik',
		tokenIDParam: '0300000000000000,0400000000000000',
		network: 'devnet,alphanet',
		limit: 10,
		offset: 0,
		sort: 'chainName:asc',
	};

	const methodDef = {
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

	it('should return correctly mapped params when called with valid params and methodDef', async () => {
		const response = transformRequest(methodDef, params);
		expect(response).toEqual({
			chainID: undefined,
			chainName: undefined,
			limit: 10,
			network: 'devnet,alphanet',
			offset: 0,
			search: undefined,
			sort: 'chainName:asc',
			tokenID: '0300000000000000,0400000000000000',
			tokenName: 'Lisk,Lis,Lik',
		});
	});

	it('should return params when called with null methodDef', async () => {
		const response = transformRequest(null, params);
		expect(response).toEqual(params);
	});

	it('should return null when called with null params', async () => {
		const response = transformRequest(methodDef, null);
		expect(response).toEqual(null);
	});

	it('should return params when called with undefined methodDef', async () => {
		const response = transformRequest(undefined, params);
		expect(response).toEqual(params);
	});

	it('should return all keys with undefined value when called with undefined params', async () => {
		const response = transformRequest(methodDef, undefined);
		expect(response).toEqual({
			chainID: undefined,
			chainName: undefined,
			limit: undefined,
			network: undefined,
			offset: undefined,
			search: undefined,
			sort: undefined,
			tokenID: undefined,
			tokenName: undefined,
		});
	});

	it('should return null when called with null methodDef and params', async () => {
		const response = transformRequest(null, null);
		expect(response).toEqual(null);
	});

	it('should return undefined null when called with undefined methodDef and params', async () => {
		const response = transformRequest(undefined, undefined);
		expect(response).toEqual(undefined);
	});
});

describe('Test transformResponse method', () => {
	const methodDef = {
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

	const data = {
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

	it('should return correctly mapped data when called with valid methodDef and data', async () => {
		const response = await transformResponse(methodDef, data);
		expect(response).toEqual({
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
		});
	});

	it('should return data when called with null methodDef', async () => {
		const response = await transformResponse(null, data);
		expect(response).toEqual(data);
	});

	it('should throw when called with null data', async () => {
		expect(() => transformResponse(methodDef, null)).rejects.toThrow();
	});

	it('should return data when called with undefined methodDef', async () => {
		const response = await transformResponse(undefined, data);
		expect(response).toEqual(data);
	});

	it('should throw when called with undefined data', async () => {
		expect(() => transformResponse(methodDef, undefined)).rejects.toThrow();
	});

	it('should return null when called with null methodDef and data', async () => {
		const response = await transformResponse(null, null);
		expect(response).toEqual(null);
	});

	it('should return undefined null when called with undefined methodDef and data', async () => {
		const response = await transformResponse(undefined, undefined);
		expect(response).toEqual(undefined);
	});
});

describe('Test transformResponse method', () => {
	const apiNames = ['http-version3', 'http-exports'];
	const config = {
		whitelist: [],
		aliases: {},
	};
	const registeredModuleNames = ['fee', 'interoperability', 'legacy', 'pos', 'random', 'token', 'validators'];
	const expectedResponse = {
		whitelist: [
			'indexer.blocks.assets',
			'indexer.blockchain.apps',
			'app-registry.blockchain.apps.meta.list',
			'app-registry.blockchain.apps.meta',
			'indexer.blockchain.apps.statistics',
			'app-registry.blockchain.apps.meta.tokens',
			'indexer.blocks',
			'indexer.events',
			'fees.estimates',
			'indexer.generators',
			'indexer.index.status',
			'connector.invokeEndpoint',
			'market.prices',
			'indexer.network.statistics',
			'indexer.network.status',
			'newsfeed.articles',
			'indexer.peers',
			'indexer.transactions.post',
			'indexer.schemas',
			'gateway.spec',
			'indexer.transactions',
			'indexer.transactions.dryrun',
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
			'indexer.token.constants',
			'indexer.tokens',
			'indexer.tokens.summary',
			'indexer.validator',
			'indexer.validateBLSKey',
			'export.transactions.csv',
			'export.transactions.schedule',
		],
		aliases: {
			'GET blocks/assets': 'indexer.blocks.assets',
			'GET blockchain/apps': 'indexer.blockchain.apps',
			'GET blockchain/apps/meta/list': 'app-registry.blockchain.apps.meta.list',
			'GET blockchain/apps/meta': 'app-registry.blockchain.apps.meta',
			'GET blockchain/apps/statistics': 'indexer.blockchain.apps.statistics',
			'GET blockchain/apps/meta/tokens': 'app-registry.blockchain.apps.meta.tokens',
			'GET blocks': 'indexer.blocks',
			'GET events': 'indexer.events',
			'GET fees': 'fees.estimates',
			'GET generators': 'indexer.generators',
			'GET index/status': 'indexer.index.status',
			'POST invoke': 'connector.invokeEndpoint',
			'GET market/prices': 'market.prices',
			'GET network/statistics': 'indexer.network.statistics',
			'GET network/status': 'indexer.network.status',
			'GET newsfeed': 'newsfeed.articles',
			'GET peers': 'indexer.peers',
			'POST transactions': 'indexer.transactions.post',
			'GET schemas': 'indexer.schemas',
			'GET spec': 'gateway.spec',
			'GET transactions': 'indexer.transactions',
			'POST transactions/dryrun': 'indexer.transactions.dryrun',
			'GET transactions/statistics': 'statistics.transactions.statistics',
			'GET legacy': 'indexer.legacy',
			'GET pos/rewards/claimable': 'indexer.pos.rewards.claimable',
			'GET pos/constants': 'indexer.pos.constants',
			'GET pos/rewards/locked': 'indexer.pos.rewards.locked',
			'GET pos/stakers': 'indexer.pos.stakers',
			'GET pos/stakes': 'indexer.pos.stakes',
			'GET pos/unlocks': 'indexer.pos.unlocks',
			'GET pos/validators': 'indexer.pos.validators',
			'GET token/account/exists': 'indexer.token.account.exists',
			'GET token/constants': 'indexer.token.constants',
			'GET tokens': 'indexer.tokens',
			'GET tokens/summary': 'indexer.tokens.summary',
			'GET validator': 'indexer.validator',
			'POST validator/validateBLSKey': 'indexer.validateBLSKey',
			'GET export/download': 'export.transactions.csv',
			'GET export/transactions': 'export.transactions.schedule',
		},
	};

	it('should return correct api info when called with valid inputs', async () => {
		const response = await registerApi(apiNames, config, registeredModuleNames);
		expect(response).toEqual({
			onBeforeCall: response.onBeforeCall,
			onAfterCall: response.onAfterCall,
			...expectedResponse,
		});
		expect(typeof response.onBeforeCall).toEqual('function');
		expect(typeof response.onAfterCall).toEqual('function');
	});

	it('should throw when called with null apiNames or config or registeredModuleNames', async () => {
		expect(() => registerApi(null, config, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, null, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, config, null)).toThrow();
	});

	it('should throw when called with null inputs', async () => {
		expect(() => registerApi(null, null, null)).toThrow();
	});

	it('should throw when called with undefined apiNames or config or registeredModuleNames', async () => {
		expect(() => registerApi(undefined, config, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, undefined, registeredModuleNames)).toThrow();
		expect(() => registerApi(apiNames, config, undefined)).toThrow();
	});

	it('should throw when called with undefined inputs', async () => {
		expect(() => registerApi(undefined, undefined, undefined)).toThrow();
	});
});
