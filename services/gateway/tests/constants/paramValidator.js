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
const regex = require('../../shared/regex');

const mapObjectWithPropertyPropName = 'default';
const mapObjectWithPropertyObj = {
	key1: {
		key11: 'val11',
		[mapObjectWithPropertyPropName]: 'default_val_1',
	},
	key2: {
		key22: 'val21',
		'not-default': 'not_default_val_2',
	},
	key3: {
		key31: {
			key311: 'val311',
		},
		[mapObjectWithPropertyPropName]: 'default_val_3',
	},
};
const mapObjectWithPropertyExpectedResponse = {
	key1: 'default_val_1',
	key3: 'default_val_3',
};

const objDiffTestedObject = {
	key1: 'val1',
	key2: 'val2',
	key3: 'val3',
};
const objDiffReference = {
	key2: 'val2',
	key4: 'val4',
	key6: 'val6',
};
const objDiffExpectedResponse = [
	'key1',
	'key3',
];

const dropEmptyPropsInput = {
	key1: 'val1',
	emptyVal: '',
	undefinedVal: undefined,
	nullVal: null,
	objVal: {
		objKey: 'objVal',
	},
	key2: 2,
};
const dropEmptyPropsExpectedResponse = {
	key1: 'val1',
	undefinedVal: undefined,
	nullVal: null,
	objVal: {
		objKey: 'objVal',
	},
	key2: 2,
};

const parseParamsInput = {
	swaggerParams: {
		moduleCommand: 'pos:stake',
		limit: 1,
		offset: 0,
		sort: 'timestamp:desc',
		order: 'index:asc',
	},
	inputParams: {
		limit: '1',
		offset: 0,
		sort: 'timestamp:desc',
		order: 'index:asc',
		moduleCommand: 'pos:stake',
		invalidKey: 'invalidValue',
	},
};
const parseParamsExpectedResponse = {
	valid: {
		moduleCommand: 'pos:stake',
		limit: 1,
		offset: 0,
		sort: 'timestamp:desc',
		order: 'index:asc',
	},
	unknown: {
		invalidKey: 'invalidValue',
	},
};

const validateRawInputParams = {
	network: 'devnet,alphanet',
	tokenID: '0300000000000000,0400000000000000',
	tokenName: 'Lisk,Lis,Lik',
};
const validateRawInputParamsWithInvalidKey = {
	...validateRawInputParams,
	invalidKey: 'invalidValue',
};

const validateSpecs = {
	version: '2.0',
	swaggerApiPath: '/blockchain/apps/meta/tokens',
	rpcMethod: 'get.blockchain.apps.meta.tokens',
	tags: [
		'Interoperability',
	],
	params: {
		chainName: { optional: true, type: 'string', pattern: regex.NAME },
		chainID: { optional: true, type: 'string', pattern: regex.CHAIN_ID },
		tokenName: { optional: true, type: 'string', pattern: regex.NAME_CSV },
		tokenID: { optional: true, type: 'string', pattern: regex.TOKEN_ID_CSV, altSwaggerKey: 'tokenIDCSV' },
		network: { optional: true, type: 'string', pattern: regex.NETWORK_CSV },
		search: { optional: true, type: 'string' },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
		sort: {
			optional: true,
			type: 'string',
			enum: ['chainName:asc', 'chainName:desc'],
			default: 'chainName:asc',
		},
	},
	schema: {
		'/blockchain/apps/meta/tokens': {
			get: {
				tags: [
					'Interoperability',
				],
				summary: 'Requests blockchain applications off-chain metadata for tokens',
				description: 'Returns blockchain applications off-chain metadata for tokens\n RPC => get.blockchain.apps.meta.tokens',
				parameters: [
					{
						$ref: '#/parameters/chainName',
					},
					{
						$ref: '#/parameters/chainID',
					},
					{
						$ref: '#/parameters/tokenName',
					},
					{
						$ref: '#/parameters/tokenIDCSV',
					},
					{
						$ref: '#/parameters/network',
					},
					{
						$ref: '#/parameters/search',
					},
					{
						$ref: '#/parameters/limit',
					},
					{
						$ref: '#/parameters/offset',
					},
					{
						name: 'sort',
						in: 'query',
						description: 'Fields to sort results by.',
						required: false,
						type: 'string',
						enum: [
							'chainName:asc',
							'chainName:desc',
						],
						default: 'chainName:asc',
					},
				],
				responses: {
					200: {
						description: 'Returns a list of blockchain applications off-chain metadata for tokens',
						schema: {
							$ref: '#/definitions/BlockchainAppsTokenMetadataWithEnvelope',
						},
					},
					400: {
						description: 'Bad request',
						schema: {
							$ref: '#/definitions/badRequest',
						},
					},
					404: {
						description: 'Not found',
						schema: {
							$ref: '#/definitions/notFound',
						},
					},
				},
			},
		},
	},
	source: {
		type: 'moleculer',
		method: 'app-registry.blockchain.apps.meta.tokens',
		params: {
			chainName: '=,string',
			chainID: '=,string',
			tokenName: '=,string',
			tokenID: '=,string',
			network: '=,string',
			search: '=,string',
			offset: '=,number',
			limit: '=,number',
			sort: '=,string',
		},
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
				},
			],
			meta: {
				count: '=,number',
				offset: '=,number',
				total: '=,number',
			},
			links: {

			},
		},
	},
	envelope: {
		data: [

		],
		meta: {

		},
	},
};
const validateExpectedParamReport = {
	valid: {
		tokenName: 'Lisk,Lis,Lik',
		tokenID: '0300000000000000,0400000000000000',
		network: 'devnet,alphanet',
		limit: 10,
		offset: 0,
		sort: 'chainName:asc',
	},
	unknown: {

	},
	required: [

	],
	missing: [

	],
	invalid: [

	],
};
const validateInvalidKeyExpectedResponse = {
	valid: {
		tokenName: 'Lisk,Lis,Lik',
		tokenID: '0300000000000000,0400000000000000',
		network: 'devnet,alphanet',
		limit: 10,
		offset: 0,
		sort: 'chainName:asc',
	},
	unknown: {
		invalidKey: 'invalidValue',
	},
	required: [

	],
	missing: [

	],
};

const checkMissingParamsRouteParams = {
	key1: {
		key11: 'val11',
		required: true,
	},
	key2: {
		required: true,
		key11: 'val11',
	},
	key3: {
		key31: 'val31',
	},
};
const checkMissingParamsRequestParams = {
	key1: {
		key11: 'val11',
	},
	key2: {
		required: true,
		key11: 'val11',
	},
	key4: {
		key41: 'val41',
	},
};

const parseDefaultParamsObj = {
	key1: {
		key11: 'val11',
		[mapObjectWithPropertyPropName]: 'default_val_1',
	},
	key2: {
		key22: 'val21',
		'not-default': 'not_default_val_2',
	},
	key3: {
		key31: {
			key311: 'val311',
		},
		[mapObjectWithPropertyPropName]: 'default_val_3',
	},
};
const parseDefaultParamsExpectedResponse = {
	key1: 'default_val_1',
	key3: 'default_val_3',
};

const parseAllParamsRouteParams = {
	notPresentInRequest: {
		default: 'default value',
	},
	numberType: {
		type: 'number',
	},
	stringType: {
		type: 'string',
	},
	booleanType: {
		type: 'boolean',
	},
};
const parseAllParamsRequestParams = {
	numberType: '123',
	stringType: 'some string',
	booleanType: true,
	notPresentInSchema: 'user sent value',
};
const parseAllParamsExpectedResponse = {
	notPresentInRequest: 'default value',
	numberType: 123,
	stringType: 'some string',
	booleanType: true,
};

const looseSpecParamsInput = {
	booleanKey: {
		key: true,
		type: 'boolean',
	},
	stringKey: {
		key: 'value',
		type: 'string',
	},
	numberKey: {
		key: 123,
		type: 'number',
	},
	objectKey: {
		key: {},
		type: 'object',
	},
};
const looseSpecParamsExpectedResponse = {
	booleanKey: {
		key: true,
		type: 'boolean',
		convert: true,
	},
	stringKey: {
		key: 'value',
		type: 'string',
	},
	numberKey: {
		key: 123,
		type: 'number',
		convert: true,
	},
	objectKey: {
		key: {},
		type: 'object',
	},
};

module.exports = {
	mapObjectWithPropertyPropName,
	mapObjectWithPropertyObj,
	mapObjectWithPropertyExpectedResponse,

	objDiffReference,
	objDiffTestedObject,
	objDiffExpectedResponse,

	dropEmptyPropsInput,
	dropEmptyPropsExpectedResponse,

	parseParamsInput,
	parseParamsExpectedResponse,

	validateRawInputParams,
	validateRawInputParamsWithInvalidKey,
	validateSpecs,
	validateExpectedParamReport,
	validateInvalidKeyExpectedResponse,

	checkMissingParamsRequestParams,
	checkMissingParamsRouteParams,

	parseDefaultParamsObj,
	parseDefaultParamsExpectedResponse,

	parseAllParamsRouteParams,
	parseAllParamsRequestParams,
	parseAllParamsExpectedResponse,

	looseSpecParamsInput,
	looseSpecParamsExpectedResponse,
};
