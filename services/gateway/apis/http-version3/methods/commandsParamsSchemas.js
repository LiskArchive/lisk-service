/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const commandsParamsSchemaSource = require('../../../sources/version3/commandsParamsSchemas');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const { transformParams, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/commands/parameters/schemas',
	rpcMethod: 'get.commands.parameters.schemas',
	tags: ['Transactions'],
	params: {
		moduleCommand: { optional: true, type: 'string', min: 3, pattern: /[a-z]+:[a-z]+/ },
	},
	paramsRequired: false,
	validParamPairings: [
		['moduleCommandID'],
		['moduleCommandName'],
	],
	get schema() {
		const commandsParamsSchema = {};
		commandsParamsSchema[this.swaggerApiPath] = { get: {} };
		commandsParamsSchema[this.swaggerApiPath].get.tags = this.tags;
		commandsParamsSchema[this.swaggerApiPath].get.summary = 'Requests commands params schema';
		commandsParamsSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns commands params schema',
		});
		commandsParamsSchema[this.swaggerApiPath].get.parameters = transformParams('transactions', this.params);
		commandsParamsSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'Returns a list of commands params schemas',
				schema: {
					$ref: '#/definitions/commandsParamsSchemaWithEnvelope',
				},
			},
			404: {
				description: 'Not found',
				schema: {
					$ref: '#/definitions/notFoundEnvelope',
				},
			},
			400: {
				description: 'Bad input parameter',
				schema: {
					$ref: '#/definitions/badRequest',
				},
			},
		};
		return commandsParamsSchema;
	},
	source: commandsParamsSchemaSource,
	envelope,
};
