/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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

const { getApiClient } = require('../common/wsRequest');

const config = require('../../../../config');

const register = async (events) => {
	const apiClient = await getApiClient();
	logger.info(`Registering ${config.endpoints.liskWs} for blockchain events`);

	apiClient.subscribe('app:block:new', data => {
		const block = apiClient.block.decode(data.block);
		events.newBlock({ id: block.header.id.toString('hex') });
		events.calculateFeeEstimate();
	});
};

module.exports = { register };
