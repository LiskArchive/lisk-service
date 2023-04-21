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
const transformParamsInput = {
	'key to be overwritten': {
		altSwaggerKey: 'custom swagger key',
	},
	sort: {
		type: 'string',
		enum: [
			'name:asc',
			'name:desc',
		],
		default: 'name:asc',
	},
	order: {
		type: 'string',
		enum: [
			'rank:asc',
			'rank:desc',
		],
		default: 'rank:asc',
	},
	'custom key': {},
};

const transformParamsExpectedResponse = [
	{
		$ref: '#/parameters/custom swagger key',
	},
	{
		name: 'sort',
		in: 'query',
		description: 'Fields to sort results by.',
		required: false,
		type: 'string',
		enum: [
			'name:asc',
			'name:desc',
		],
		default: 'name:asc',
	},
	{
		name: 'order',
		in: 'query',
		description: 'Fields to order results by. The order condition is applied after the sort condition, usually to break ties when the sort condition results in collision.',
		required: false,
		type: 'string',
		enum: [
			'rank:asc',
			'rank:desc',
		],
		default: 'rank:asc',
	},
	{
		$ref: '#/parameters/custom key',
	},
];

const requireAllJsonExpectedResponse = {
	definitions: {
		ExportScheduled: {
			type: 'object',
			required: [
				'address',
			],
			properties: {
				address: {
					type: 'string',
					format: 'address',
					example: 'lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99',
					description: "The Lisk Address is the human readable representation of the accounts owners' public key.\nIt is 41 character long address thats begins with `lsk`.\n",
				},
				publicKey: {
					type: 'string',
					format: 'publicKey',
					example: 'b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd',
					description: 'The public key is derived from the private key of the owner of the account.\nIt can be used to validate that the private key belongs to the owner, but not provide access to the owners private key.\n',
				},
				interval: {
					type: 'string',
					format: 'interval',
					example: '2020-10-01:2020-10-31',
					description: 'The date interval for which the transactions need to be exported.\n',
				},
			},
		},
		ExportScheduledWithEnvelope: {
			type: 'object',
			required: [
				'data',
				'meta',
			],
			properties: {
				data: {
					description: 'Transaction history export information',
					type: 'object',
					$ref: '#/definitions/ExportScheduled',
				},
				meta: {
					type: 'object',
					properties: {
						ready: {
							type: 'boolean',
							example: 'false',
							description: 'False when scheduled to export. True when already exported and available for download',
						},
					},
				},
				links: {
					type: 'object',
				},
			},
		},
		ExportFile: {
			type: 'object',
			required: [
				'address',
			],
			properties: {
				address: {
					type: 'string',
					format: 'address',
					example: 'lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99',
					description: "The Lisk Address is the human readable representation of the accounts owners' public key.\nIt is 41 character long address thats begins with `lsk`.\n",
				},
				publicKey: {
					type: 'string',
					format: 'publicKey',
					example: 'b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd',
					description: 'The public key is derived from the private key of the owner of the account.\nIt can be used to validate that the private key belongs to the owner, but not provide access to the owners private key.\n',
				},
				interval: {
					type: 'string',
					format: 'interval',
					example: '2020-10-01:2020-10-31',
					description: 'The date interval for which the transactions need to be exported.\n',
				},
				fileName: {
					type: 'string',
					format: 'fileName',
					example: 'transactions_<address>_<from>_<to>.csv',
					description: 'The name of the file containing the exported account transaction history.\n',
				},
				fileUrl: {
					type: 'string',
					format: 'fileUrl',
					example: '/api/v3/exports/transactions_<address>_<from>_<to>.csv',
					description: 'The file URL path containing the exported account transaction history.\n',
				},
			},
		},
		ExportFileUrlWithEnvelope: {
			type: 'object',
			required: [
				'data',
				'meta',
			],
			properties: {
				data: {
					description: 'Transaction history export information',
					type: 'object',
					$ref: '#/definitions/ExportFile',
				},
				meta: {
					type: 'object',
					properties: {
						ready: {
							type: 'boolean',
							example: 'true',
							description: 'True when already exported and available for download. False when scheduled to export',
						},
					},
				},
				links: {
					type: 'object',
				},
			},
		},
	},
	parameters: {
		address: {
			name: 'address',
			in: 'query',
			description: 'Address of the account to query',
			type: 'string',
			format: 'address',
			minLength: 41,
			maxLength: 41,
		},
		publicKey: {
			name: 'publicKey',
			in: 'query',
			description: 'Public key of the account to query',
			type: 'string',
			format: 'publicKey',
			minLength: 64,
			maxLength: 64,
		},
		interval: {
			name: 'interval',
			in: 'query',
			description: 'Date interval to query in YYYY-MM-DD format',
			type: 'string',
			format: 'interval',
			minLength: 10,
			maxLength: 21,
		},
		filename: {
			name: 'filename',
			in: 'query',
			description: 'Filename',
			required: true,
			type: 'string',
			minLength: 80,
			maxLength: 80,
		},
	},
	apiJson: {
		swagger: '2.0',
		info: {
			title: 'Lisk Service API',
			version: '3.0',
			contact: {
				email: 'admin@lisk.com',
			},
			description: "# Lisk Service API Documentation\n\nLisk Service is a middleware web application that interacts with the entire Lisk ecosystem in various aspects, such as accessing blockchain data, storing users' private data, retrieving and storing the market data, and interacting with social media. \n\nThe main focus of this project is to provide data to Lisk blockchain users by serving them in a standardized JSON format and exposing a public RESTful API. The project is split into several smaller components each focused on serving a single specific purpose. \n\nAs a pure backend project, it is designed to meet the requirements of the frontend developers, especially Lisk Desktop and Lisk Mobile.\n\nThe API can be accessed at `https://service.lisk.com`.\nIt is also possible to access the Testnet network at `https://testnet-service.lisk.com`.\n\nThe Lisk Service API is compatible with RESTful guidelines. The specification below contains numerous examples of how to use the API in practice.\n\n## Endpoint Logic\n\nThe logic of the endpoints are as follows:\n- the structure is always based on `/<root_entity>/<object>/<properties>`\n\n## Responses\n\nAll responses are returned in the JSON format - `application/json`.\n\nEach API request has the following structure:\n\n```\n{\n  \"data\": {}, // Contains the requested data\n  \"meta\": {}, // Contains additional metadata, e.g. the values of `limit` and `offset`\n}\n```\n\nAnd, the error responses adhere to the following structure:\n\n```\n{\n  \"error\": true,\n  \"message\": \"Not found\", // Contains the error message\n}\n```",
			license: {
				name: 'GPL v3.0',
				url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
			},
		},
		basePath: '/api/v3',
		tags: [
			{
				name: 'Account History Export',
				description: 'Lisk Network transaction history export API.',
			},
		],
		schemes: [
			'http',
			'https',
		],
		paths: {

		},
	},
	responses: {
		badParameter: {
			description: 'Bad request',
			schema: {
				$ref: '#/definitions/badRequest',
			},
		},
		notFound: {
			description: 'Not found',
			schema: {
				$ref: '#/definitions/notFound',
			},
		},
	},
};

module.exports = {
	transformParamsInput,
	transformParamsExpectedResponse,
	requireAllJsonExpectedResponse,
};
