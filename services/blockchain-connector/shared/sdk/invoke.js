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
const { invokeEndpoint } = require('./client');
const { formatResponse } = require('./formatter');

const invokeEndpointProxy = async (endpoint, params) => {
	const response = await invokeEndpoint(endpoint, params);
	const formattedResponse = formatResponse(endpoint, response);
	return formattedResponse;
};

module.exports = {
	invokeEndpointProxy,
};
