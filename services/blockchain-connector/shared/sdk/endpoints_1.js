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

// Constants
const timeoutMessage = 'Response not received in';

// Caching for constants from SDK application
let schema;
let registeredActions;
let registeredEvents;
let registeredModules;

const getSchemas = async () => {
	try {
		if (!schema) {
			schema = await invokeEndpoint('app_getSchema');
		}
		return schema;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getSchema\'');
		}
		throw err;
	}
};

const getRegisteredActions = async () => {
	try {
		if (!registeredActions) {
			registeredActions = await invokeEndpoint('app_getRegisteredActions');
		}
		return registeredActions;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getRegisteredActions\'');
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
			throw new TimeoutException('Request timed out when calling \'getRegisteredEvents\'');
		}
		throw err;
	}
};

const getRegisteredModules = async () => {
	try {
		if (!registeredModules) {
			registeredModules = await invokeEndpoint('app_getRegisteredModules');
		}
		return registeredModules;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getRegisteredModules\'');
		}
		throw err;
	}
};

const getNodeInfo = async () => {
	try {
		const nodeInfo = await invokeEndpoint('app_getNodeInfo');
		return nodeInfo;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getNodeInfo\'');
		}
		throw err;
	}
};

module.exports = {
	getSchemas,
	getRegisteredActions,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
};
