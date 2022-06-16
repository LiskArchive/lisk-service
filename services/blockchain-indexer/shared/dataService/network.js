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
const { requestConnector } = require('../utils/request');
const { getAvailableModuleCommands, getRegisteredModules } = require('../constants');

const getNetworkStatus = async () => {
	const status = await requestConnector('getNodeInfo');

	status.moduleCommands = await getAvailableModuleCommands();
	status.registeredModules = await getRegisteredModules();
	status.lastUpdate = Math.floor(Date.now() / 1000);
	status.constants = { nethash: status.networkIdentifier };

	return {
		data: status,
		meta: {},
	};
};

module.exports = {
	getNetworkStatus,
};
