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
const path = require('path');
const fs = require('fs');

const transformParams = (type, params) => {
	const data = [];
	const paramsKeys = Object.keys(params);

	paramsKeys.forEach((paramKey) => {
		let value = {};

		if (params[paramKey].altSwaggerKey) {
			value = {
				$ref: `#/parameters/${params[paramKey].altSwaggerKey}`,
			};
		} else if (paramKey === 'sort') {
			value = {
				name: 'sort',
				in: 'query',
				description: 'Fields to sort results by.',
				required: false,
				type: params[paramKey].type,
				enum: params[paramKey].enum,
				default: params[paramKey].default,
			};
		} else if (paramKey === 'order') {
			value = {
				name: 'order',
				in: 'query',
				description: 'Fields to order results by. The order condition is applied after the sort condition, usually to break ties when the sort condition results in collision.',
				required: false,
				type: params[paramKey].type,
				enum: params[paramKey].enum,
				default: params[paramKey].default,
			};
		} else value = { $ref: `#/parameters/${paramKey}` };

		data.push(value);
	});
	return data;
};

const response = {
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
};

const requireAllJson = apiName => {
	const data = {
		definitions: {},
		parameters: {},
	};
	const dir = path.resolve(__dirname, `../apis/${apiName}/swagger`);
	const result = fs.readdirSync(dir);
	result.forEach(fileName => {
		if (fileName === 'definitions') {
			const definitions = fs.readdirSync(`${dir}/definitions`);
			definitions.forEach(definition => {
				/* eslint-disable-next-line import/no-dynamic-require */
				const content = require(`${dir}/definitions/${definition}`);
				Object.assign(data.definitions, content);
			});
		} else if (fileName === 'parameters') {
			const parameters = fs.readdirSync(`${dir}/parameters`);
			parameters.forEach(parameter => {
				/* eslint-disable-next-line import/no-dynamic-require */
				const content = require(`${dir}/parameters/${parameter}`);
				Object.assign(data.parameters, content);
			});
		} else {
			/* eslint-disable-next-line import/no-dynamic-require */
			const content = require(`${dir}/${fileName}`);
			Object.assign(data, content);
		}
	});
	return data;
};

const getSwaggerDescription = params => `${params.description}\n RPC => ${params.rpcMethod}`;

const isValidNonEmptyResponse = res => {
	if (Array.isArray(res.data) && res.data.length) return true;
	if ((res.data && res.data.constructor.name === 'Object') && Object.getOwnPropertyNames(res.data).length) return true;
	return false;
};

module.exports = {
	transformParams,
	response,
	requireAllJson,
	getSwaggerDescription,
	isValidNonEmptyResponse,
};
