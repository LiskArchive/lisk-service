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
import Joi from '@hapi/joi';

import api from '../../helpers/api';
import config from '../../config';

import networkStatisticsSchema from '../../schemas/networkStatistics.schema';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpointStatus = `${baseUrlV1}/network/status`;
const endpointStatistics = `${baseUrlV1}/network/statistics`;

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

const goodRequestSchema = Joi.object({
	data: Joi.object().required(),
	meta: Joi.object().required(),
	links: Joi.object().required(),
});

describe('Network API', () => {
	describe(`GET ${endpointStatus}`, () => {
		it('retrieves network status -> ok', async () => {
			const response = await api.get(`${endpointStatus}`);
			expect(response).toMapRequiredSchema(networkSchema);
		});
	});

	describe(`GET ${endpointStatistics}`, () => {
		it('retrieves network statistics -> ok', async () => {
			const response = await api.get(endpointStatistics);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toMap(networkStatisticsSchema);
		});
	});
});
