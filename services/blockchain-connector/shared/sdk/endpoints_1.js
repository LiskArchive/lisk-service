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
const { Signals } = require('lisk-service-framework');
const { invokeEndpoint } = require('./client');

const { engineEndpoints } = require('./constants/endpoints');

// Caching for constants from SDK application
let metadata;
let nodeInfo;
let schema;
let registeredEndpoints;
let registeredEvents;
let registeredModules;

const getSchemas = async () => {
	if (!schema) {
		schema = await invokeEndpoint('system_getSchema');
		schema.ccm = (await invokeEndpoint('interoperability_getCCMSchema')).schema;
	}
	return schema;
};

const getRegisteredEndpoints = async () => {
	if (!registeredEndpoints) {
		registeredEndpoints = await invokeEndpoint('app_getRegisteredEndpoints');
	}
	return registeredEndpoints;
};

const getRegisteredEvents = async () => {
	if (!registeredEvents) {
		registeredEvents = await invokeEndpoint('app_getRegisteredEvents');
	}
	return registeredEvents;
};

const getNodeInfo = async (isForceUpdate = false) => {
	if (isForceUpdate || !nodeInfo) {
		nodeInfo = await invokeEndpoint('system_getNodeInfo');
		Signals.get('systemNodeInfo').dispatch(nodeInfo);
	}
	return nodeInfo;
};

const getSystemMetadata = async () => {
	if (!metadata) {
		metadata = await invokeEndpoint('system_getMetadata');
	}
	return metadata;
};

const getRegisteredModules = async () => {
	if (!registeredModules) {
		const systemMetadata = await getSystemMetadata();
		registeredModules = systemMetadata.modules.map(module => module.name);
	}
	return registeredModules;
};

const getEngineEndpoints = () => engineEndpoints;

module.exports = {
	getSchemas,
	getRegisteredEndpoints,
	getRegisteredEvents,
	getRegisteredModules,
	getNodeInfo,
	getSystemMetadata,
	getEngineEndpoints,
};
