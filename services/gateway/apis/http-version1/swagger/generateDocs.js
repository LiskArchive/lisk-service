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
const { Utils } = require('lisk-service-framework');
const path = require('path');

const { parameters, definitions, responses } = require('./apiSchema');

const genDocs = async () => {
	const apiJson = {
		swagger: '2.0',
		info: {
			title: 'Lisk Service API',
			version: '1.0',
			contact: {
				email: 'admin@lisk.io',
			},
			description:
				'# Lisk Service API Documentation\n\nThe Lisk Service is a web application that interacts with the whole Lisk ecosystem in various aspects: by accessing blockchain data, storing users\' private data, retrieving and storing market data and interacting with social media. \n\nThe main focus of this project is to provide data to Lisk blockchain users by serving them in standardized JSON format and exposing a public RESTful API. The project is planned to split into several smaller components. The general idea is to provide one component for one particular purpose. \n\nAs a purely backend project it is designed to meet requirements of frontend developers, especially Lisk Hub and Lisk Mobile.\n\nThe API can be accessed by the `https://service.lisk.io`.\nYou can also access the testnet network by `https://testnet-service.lisk.io`\n\nThe Lisk Service API is compatible with RESTful guidelines. The specification below contains numerous examples how to use the API in practice.\n\n## Endpoint Logic\n\nThe logic of the endpoints comes as follows:\n- the structure is always based on `/<root_entity>/<object>/<properties>`\n\n## Responses\n\nAll responses are returned in the JSON format - `application/json`.\n\nEach API request has the following structure:\n\n```\n{\n  "data": {}, // Contains the requested data\n  "meta": {}, // Contains additional metadata, e.g. the values of `limit` and `offset`\n  "links": {} // Contains links to connected API calls from here, e.g. pagination links\n}\n```\n\n## The `account_id` Parameter\n\nUsers that want to retrieve account data can rely on its unique properties: Account ID (ex. 1234567L), public key or a registered delegate name.\n\n## Date Format\n\nIn the contrary to the original Lisk Core API, all timestamps used by the Lisk Service are in the UNIX timestamp format. The blockchain dates are always expressed as integers and the epoch date is equal to the number of seconds since 1970-01-01 00:00:00.\n',
			license: {
				name: 'GPL v3.0',
				url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
			},
		},
		// host: localhost:9901
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
			{
				name: 'Network',
				description: 'Lisk Network utils',
			},
		],
		schemes: ['http', 'https'],
		paths: {},
	};

	const services = Utils.requireAllJs(path.resolve(__dirname, '../methods'));
	const methods = Object.keys(services).reduce((acc, key) => {
		const method = services[key];
		return { ...acc, [key]: method.schema };
	}, {});
	const apiSchemas = Object.keys(methods);
	apiSchemas.forEach((key) => {
		Object.assign(apiJson.paths, methods[key]);
	});
	apiJson.parameters = parameters;
	apiJson.definitions = definitions;
	apiJson.responses = responses;
	return apiJson;
};
module.exports = {
	genDocs,
};
