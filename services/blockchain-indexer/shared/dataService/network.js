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

const resolvemoduleCommands = (data) => {
	let result = [];
	data.forEach(liskModule => {
		if (liskModule.commands.length) {
			result = result.concat(
				liskModule.commands.map(command => {
					const id = String(liskModule.id).concat(':').concat(command.id);
					if (liskModule.name && command.name) {
						const name = liskModule.name.concat(':').concat(command.name);
						return { id, name };
					}
					return { id };
				}),
			);
		}
	});
	return result;
};

const getNetworkStatus = async () => {
	const status = await requestConnector('getNetworkStatus');

	status.moduleCommands = resolvemoduleCommands(status.registeredModules);
	status.registeredModules = status.registeredModules.map(item => item.name);
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
