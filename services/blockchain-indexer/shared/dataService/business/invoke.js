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
const { getRegisteredEndpoints, getSystemMetadata } = require('../../constants');
const { engineBasedEndpoints } = require('../../endpointConstants');

const checkIfEndpointRegistered = async (endpoint) => {
	const registeredEndpoints = await getRegisteredEndpoints();
	const allregisteredEndpoints = engineBasedEndpoints
		.map(e => e.name)
		.concat(registeredEndpoints);
	return allregisteredEndpoints.includes(endpoint);
};

const validateEndpointParams = async (invokeEndpointParams) => {
	try {
		let requestParamsSchema;

		const registeredEndpoints = await getRegisteredEndpoints();

		// Check if module or engine based endpoint
		// Resolve request params schema based on the type of endpoint
		if (registeredEndpoints.includes(invokeEndpointParams.endpoint)) {
			const metadata = await getSystemMetadata();
			const [moduleName, endpointName] = invokeEndpointParams.endpoint.split('_');
			const endpointInfo = (metadata.modules
				.find(module => module.name === moduleName)).endpoints
				.find(endpoint => endpoint.name === endpointName);
			requestParamsSchema = endpointInfo.request;
		} else {
			const endpointInfo = engineBasedEndpoints
				.find(endpoint => endpoint.name === invokeEndpointParams.endpoint);
			requestParamsSchema = endpointInfo.request;
		}

		// Validate params only if the endpoint supports any params
		if (requestParamsSchema) validator.validate(requestParamsSchema, invokeEndpointParams.params);
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

	// For unit testing
	checkIfEndpointRegistered,
	validateEndpointParams,
};
