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

module.exports = {
	version: '2.0',
	swaggerApiPath: '/commands/parameters/schemas',
	rpcMethod: 'get.commands.parameters.schemas',
	tags: ['Transactions'],
	params: {
		moduleCommandID: { optional: true, type: 'string', min: 3, pattern: /[0-9]+:[0-9]+/ },
		moduleCommandName: { optional: true, type: 'string', min: 3, pattern: /[a-z]+:[a-z]+/ },
	},
	paramsRequired: false,
	validParamPairings: [
		['moduleCommandID'],
		['moduleCommandName'],
	],
	source: commandsParamsSchemaSource,
	envelope,
};
