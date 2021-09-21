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
const { request } = require('../../../../helpers/socketIoRpcRequest');

const {
	fees,
} = require('../expectedResponse/rpc/fees');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getFees = async () => request(wsRpcUrl, 'get.fees');

describe('Fees API', () => {
	it('Retrieve fees', async () => {
		const response = await getFees();

		// response.data
		// feeEstimatePerByte might vary based on network traffic
		expect(response.result.data.feeEstimatePerByte)
			.toStrictEqual(fees.result.data.feeEstimatePerByte);
		expect(response.result.data.baseFeeById).toStrictEqual(fees.result.data.baseFeeById);
		expect(response.result.data.baseFeeByName).toStrictEqual(fees.result.data.baseFeeByName);
		expect(response.result.data.minFeePerByte).toStrictEqual(fees.result.data.minFeePerByte);
		expect(response.result.data).toStrictEqual(fees.result.data);

		// response.meta
		expect(response.result.meta.lastUpdate).toBeGreaterThanOrEqual(fees.result.meta.lastUpdate);
		expect(response.result.meta.lastBlockHeight)
			.toBeGreaterThanOrEqual(fees.result.meta.lastBlockHeight);
	});
});
