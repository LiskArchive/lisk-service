/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
import api from '../../helpers/api';
import config from '../../config';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/network/status`;

const networkSchema = {
	broadhash: 'string',
	epoch: 'string',
	fees: 'object',
	height: 'number',
	milestone: 'string',
	nethash: 'string',
	networkHeight: 'number',
	reward: 'string',
	supply: 'string',
};

describe(`GET ${endpoint}`, () => {
	it('retrieves network status -> ok', async () => {
		const response = await api.get(`${endpoint}`);
		expect(response).toMapRequiredSchema(networkSchema);
	});
});
