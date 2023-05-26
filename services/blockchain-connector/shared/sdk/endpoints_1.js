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
const { Exceptions: { TimeoutException } } = require('lisk-service-framework');
const { invokeEndpoint } = require('./client');

const { ccmSchema } = require('./constants/schemas');

// Constants
const timeoutMessage = 'Response not received in';

// Caching for constants from SDK application
let metadata;
let nodeInfo;
let schema;
let registeredEndpoints;
let registeredEvents;
let registeredModules;

const getSchemas = async () => {
	try {
		if (!schema) {
			schema = await invokeEndpoint('system_getSchema');
			// TODO: Assign ccm schema, remove once this issue is closed https://github.com/LiskHQ/lisk-sdk/issues/8375
			schema.ccm = ccmSchema;
		}
		return schema;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getSchema\'.');
		}
		throw err;
	}
};

const getRegisteredEndpoints = async () => {
	try {
		if (!registeredEndpoints) {
			registeredEndpoints = await invokeEndpoint('app_getRegisteredActions');
		}
		return registeredEndpoints;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getRegisteredEndpoints\'.');
		}
		throw err;
	}
};

const getRegisteredEvents = async () => {
	try {
		if (!registeredEvents) {
			registeredEvents = await invokeEndpoint('app_getRegisteredEvents');
		}
		return registeredEvents;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getRegisteredEvents\'.');
		}
		throw err;
	}
};

const getNodeInfo = async (isForceUpdate = false) => {
	try {
		if (isForceUpdate || !nodeInfo) {
			nodeInfo = await invokeEndpoint('system_getNodeInfo');
		}
		return nodeInfo;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getNodeInfo\'.');
		}
		throw err;
	}
};

const getSystemMetadata = async () => {
	try {
		if (!metadata) {
			metadata = await invokeEndpoint('system_getMetadata');
		}
		return metadata;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getSystemMetadata\'.');
		}
		throw err;
	}
};

const getRegisteredModules = async () => {
	try {
		if (!registeredModules) {
			const systemMetadata = await getSystemMetadata();
			registeredModules = systemMetadata.modules.map(module => module.name);
		}
		return registeredModules;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getRegisteredModules\'.');
		}
		throw err;
	}
};

module.exports = {
	getSchemas,
	getRegisteredEndpoints,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
};
