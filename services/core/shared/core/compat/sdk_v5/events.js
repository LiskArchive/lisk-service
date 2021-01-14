/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const logger = require('lisk-service-framework').Logger();

const { getClient } = require('../common/wsRequest');

const getApiClient = async () => {
    const wsClient = await getClient();
    return wsClient;
};

const config = require('../../../../config');

const register = async (events) => {
	const apiClient = await getApiClient();
	logger.info(`Registering ${config.endpoints.liskWs} for blockchain events`);

	apiClient.subscribe('app:chain:validators:change', data => {
		events.newRound(data);
	});
};

module.exports = { register };
