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
const endpoint = `${baseUrlV1}/fee_estimates`;

const feeSchema = {
	low: 'number',
	medium: 'number',
	high: 'number',
};

const metaSchema = {
	updated: 'number',
	blockHeight: 'number',
	blockId: 'string',
};

// Use schema from swagger instead

describe('Fee estimates API', () => {
	describe('GET /fee_estimates', () => {
		it('estimate fees true -> 200 ok', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response.data.feeEstimatePerByte).toMapRequiredSchema({
				...feeSchema,
			});
			expect(response.meta).toMapRequiredSchema({
				...metaSchema,
			});
		});
	});

	// Negative test for 404 - Compare schema, error message
	// Negative test with params - Compare schema, error message
});
