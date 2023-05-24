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
const util = require('util');
const { validator } = require('@liskhq/lisk-validator');

const { Exceptions: { ValidationException } } = require('lisk-service-framework');

const { requestConnector } = require('../../utils/request');
const { getRegisteredActions, getSystemMetadata } = require('../../constants');

const checkIfEndpointRegistered = async (endpoint) => {
	const registeredActions = await getRegisteredActions();
	return registeredActions.includes(endpoint);
};

const validateEndpointParams = async (params) => {
	try {
		const metadata = await getSystemMetadata();
		const [name, endpoint] = params.endpoint.split('_');

		const { request: requestParamsSchema } = (metadata.modules
			.find(module => module.name === name)).endpoints
			.find(e => e.name === endpoint);

		if (requestParamsSchema) {
			await validator.validate(requestParamsSchema, params.params);
		}
		return true;
	} catch (_) {
		return false;
	}
};

const invokeEndpoint = async params => {
	const isRegisteredEndpoint = await checkIfEndpointRegistered(params.endpoint);
	if (!isRegisteredEndpoint) {
		throw new ValidationException(`The endpoint ${params.endpoint} is not registered.`);
	}

	const isValidParams = await validateEndpointParams(params);
	if (!isValidParams) {
		throw new ValidationException(`Invalid params ${util.inspect(params.params)} for the endpoint ${params.endpoint}.`);
	}

	const invokeEndpointRes = {
		data: await requestConnector('invokeEndpoint', params),
		meta: params,
	};

	return invokeEndpointRes;
};

module.exports = {
	invokeEndpoint,
};
