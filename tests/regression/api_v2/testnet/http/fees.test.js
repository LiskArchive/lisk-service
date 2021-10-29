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
const config = require('../../../../config');
const { api } = require('../../../../helpers/api');

const {
	fees,
} = require('../expectedResponse/http/fees');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/fees`;

describe('Fees API', () => {
	it('Retrieve fees', async () => {
		const response = await api.get(`${endpoint}`);

		// response.data
		// feeEstimatePerByte might vary based on network traffic
		expect(response.data.feeEstimatePerByte).toStrictEqual(fees.data.feeEstimatePerByte);
		expect(response.data.baseFeeById).toStrictEqual(fees.data.baseFeeById);
		expect(response.data.baseFeeByName).toStrictEqual(fees.data.baseFeeByName);
		expect(response.data.minFeePerByte).toStrictEqual(fees.data.minFeePerByte);
		expect(response.data).toStrictEqual(fees.data);

		// response.meta
		expect(response.meta.lastUpdate).toBeGreaterThanOrEqual(fees.meta.lastUpdate);
		expect(response.meta.lastBlockHeight).toBeGreaterThanOrEqual(fees.meta.lastBlockHeight);
	});
});
