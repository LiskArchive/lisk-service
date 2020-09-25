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
import Joi from 'joi';

import { api } from '../../helpers/socketIoRpcRequest';
import feeSchema from './schemas/feeEstimate.schema';

const goodRequestSchema = Joi.object({
	data: Joi.object().required(),
	meta: Joi.object().required(),
});

const requestFeeEstimate = async () => api.getJsonRpcV1('get.fee_estimates');

describe('get.fee_estimates', () => {
	it('returns estimated fees', async () => {
		const response = await requestFeeEstimate();
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(feeSchema);
	});

	// Negative test for 404 - Compare schema, error message
	// Negative test with params - Compare schema, error message
});
