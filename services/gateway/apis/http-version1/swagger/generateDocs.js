/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
/* eslint-disable */
const fs = require('fs');
const YAML = require('yaml');

const convertToYaml = new YAML.Document();
const accounts = require('../methods/accounts');
const voters = require('../methods/voters');
const votes = require('../methods/votes');

const blocks = require('../methods/blocks');

const transactions = require('../methods/transactions');
const transactionsStatisticsDay = require('../methods/transactionsStatisticsDay');
const transactionsStatisticsMonth = require('../methods/transactionsStatisticsMonth');

const peers = require('../methods/peers');
const peersConnected = require('../methods/peersConnected');
const peersDisconnected = require('../methods/peersDisconnected');

const delegates = require('../methods/delegates');
const delegatesLatest = require('../methods/delegatesLatest');
const delegatesNextForgers = require('../methods/delegatesNextForgers');


const services = [
	accounts,
	blocks,
	delegates,
	transactions,
	peers,
	delegatesNextForgers,
	delegatesLatest,
	peersConnected,
	peersDisconnected,
	transactionsStatisticsDay,
	transactionsStatisticsMonth,
	voters,
	votes,
];
const { parameters, definitions } = require('./apiSchema');

const apiJson = {
	swagger: '2.0',
	info: {
		title: 'Lisk Service API',
		version: accounts.version,
		contact: {
			email: 'admin@lisk.io',
		},
		description:
			'# Lisk Service API Documentation\n\nThe Lisk Service is a web application that interacts with the whole Lisk ecosystem in various aspects: by accessing blockchain data, storing users\' private data, retrieving and storing market data and interacting with social media. \n\nThe main focus of this project is to provide data to Lisk blockchain users by serving them in standardized JSON format and exposing a public RESTful API.The project is planned to split into several smaller components. The general idea is to provide one component for one particular purpose. \n\nAs a purely backend project it is designed to meet requirements of frontend developers, especially Lisk Hub and Lisk Mobile.\n\nThe API can be accessed by the `https://service.lisk.io`.\nYou can also access the testnet network by `https://testnet-service.lisk.io`\n\nThe Lisk Service API is compatible with RESTful guidelines. The specification below contains numerous examples how to use the API in practice.\n\n## Endpoint Logic\n\nThe logic of the endpoints comes as follows:\n- the structure is always based on `/<root_entity>/<object>/<properties>`\n\n## Responses\n\nAll responses are returned in the JSON format - `application/json`.\n\nEach API request has the following structure:\n\n```\n{\n  "data": {}, // Contains the requested data\n  "meta": {}, // Contains additional metadata, e.g. the values of `limit` and `offset`\n  "links": {} // Contains links to connected API calls from here, e.g. pagination links\n}\n```\n\n## The `account_id` Parameter\n\nUsers that want to retrieve account data can rely on its unique properties: Account ID (ex. 1234567L), public key or a registered delegate name.\n\n## Date Format\n\nIn the contrary to the original Lisk Core API, all timestamps used by the Lisk Service are in the UNIX timestamp format. The blockchain dates are always expressed as integers and the epoch date is equal to the number of seconds since 1970-01-01 00:00:00.\n',
		license: {
			name: 'GPL v3.0',
			url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
		},
	},
	basePath: '/api/v1',
	tags: [
		{
			name: 'Accounts',
			description: 'Lisk Network account API calls',
		},
		{
			name: 'Blocks',
			description: 'Lisk Network block API calls',
		},
		{
			name: 'Delegates',
			description: 'Lisk Network delegate API calls',
		},
		{
			name: 'Peers',
			description: 'Lisk Network peer API calls',
		},
		{
			name: 'Transactions',
			description: 'Lisk Network transaction API calls',
		},
	],
	schemes: ['http', 'https'],
	paths: {
		'/spec': {
			'x-swagger-pipe': 'swagger_raw',
		},
	},
};

const transformParams = (item) => {
	const data = [];
	const params = Object.keys(item.params);
	params.forEach((paramKey) => {
		let value = {};
		if (item === blocks && paramKey === 'id') {
			value = { $ref: '#/parameters/block' };
		} else value = { $ref: `#/parameters/${paramKey}` };
		if (paramKey === 'sort') {
			value = {
				name: 'sort',
				in: 'query',
				description: 'Fields to sort results by',
				required: false,
				type: item.params[paramKey].type,
				enum: item.params[paramKey].enum,
				default: item.params[paramKey].default,
			};
		}
		data.push(value);
	});
	return data;
};

services.forEach((item) => {
	const schemas = {};
	const key = 'swaggerApiPath';
	schemas[item[key]] = { get: {} };
	const responses = {
		200: {
			description: '',
			schema: {
				type: 'array',
				items: {
					$ref: '',
				},
			},
		},
		400: {
			description: 'bad input parameter',
		},
		404: {
			description: 'Not found',
		},
	};
	switch (item) {
		case accounts:
			schemas[item[key]] = { get: { tags: ['Accounts'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of accounts with details',
					schema: {
						type: 'array',
						items: {
							$ref: '#/definitions/AccountsWithEnvelope',
						},
					},
				},
			});
			break;
		case blocks:
			schemas[item[key]] = { get: { tags: ['Blocks'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of blocks',
					schema: {
						type: 'array',
						items: {
							$ref: '#/definitions/BlocksWithEnvelope',
						},
					},
				},
			});
			break;
		case delegates:
			schemas[item[key]] = { get: { tags: ['Delegates'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of delegates matching filter criteria',
					schema: {
						type: 'array',
						items: {
							$ref: '#/definitions/DelegatesWithEnvelope',
						},
					},
				},
			});
			break;
		case peers:
			schemas[item[key]] = { get: { tags: ['Peers'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of peers',
					schema: {
						type: 'array',
						items: {
							$ref: '#/definitions/PeersWithEnvelope',
						},
					},
				},
			});
			break;
		case transactions:
			schemas[item[key]] = { get: { tags: ['Transactions'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of transactions',
					schema: {
						type: 'array',
						items: {
							$ref: '#/definitions/TransactionsWithEnvelope',
						},
					},
				},
			});
			break;
		case delegatesNextForgers:
			schemas[item[key]] = { get: { tags: ['Delegates'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of next forgers',
					schema: {
						type: 'array',
						items: {
							$ref: '#/definitions/DelegatesWithEnvelope',
						},
					},
				},
			});
			break;
		case delegatesLatest:
			schemas[item[key]] = { get: { tags: ['Delegates'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of recently registered delegates',
					schema: {
						type: 'array',
						items: {
							$ref: '#/definitions/DelegatesWithEnvelope',
						},
					},
				},
			});
			break;
		case peersConnected:
			schemas[item[key]] = { get: { tags: ['Peers'] } };
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of connected peers',
					schema: {
						type: 'array',
						items: {
							$ref: '#/definitions/PeersWithEnvelope',
						},
					},
				},
			});
			break;
		case peersDisconnected:
			schemas[item[key]] = { get: { tags: ['Peers'] } };
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of disconnected peers',
					schema: {
						type: 'array',
						items: {
							$ref: '#/definitions/PeersWithEnvelope',
						},
					},
				},
			});
			break;
		case transactionsStatisticsDay:
			schemas[item[key]] = { get: { tags: ['Transactions'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'object with transaction statistics',
					schema: {
						items: {
							$ref: '#/definitions/TransactionsStatisticsWithEnvelope',
						},
					},
				},
			});
			break;
		case transactionsStatisticsMonth:
			schemas[item[key]] = { get: { tags: ['Transactions'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'object with transaction statistics',
					schema: {
						items: {
							$ref: '#/definitions/TransactionsStatisticsWithEnvelope',
						},
					},
				},
			});
			break;
		case voters:
			schemas[item[key]] = { get: { tags: ['Accounts'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of votes',
					schema: {
						items: {
							$ref: '#/definitions/VotesWithEnvelope',
						},
					},
				},
			});
			break;
		case votes:
			schemas[item[key]] = { get: { tags: ['Accounts'] } };
			schemas[item[key]].get.parameters = transformParams(item);
			schemas[item[key]].get.responses = Object.assign(responses, {
				200: {
					description: 'array of votes',
					schema: {
						items: {
							$ref: '#/definitions/VotesWithEnvelope',
						},
					},
				},
			});
			break;
		default:
	}
	Object.assign(apiJson.paths, schemas);
});

apiJson.parameters = parameters;
apiJson.definitions = definitions;
convertToYaml.contents = apiJson;
fs.writeFileSync(
	'services/gateway/apis/http-version1/swagger/apidocs.yaml',
	convertToYaml,
);
