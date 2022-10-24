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
jest.setTimeout(30000);

const config = require('../../../config');
const { api } = require('../../../helpers/api');
const { VALID_TRANSACTION, INVALID_TRANSACTION } = require('../constants/dryRunTransactions');
const { waitMs } = require('../../../helpers/utils');

const {
	badRequestSchema,
	wrongInputParamSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	goodRequestSchema,
	dryrunTransactionResponseSchema,
	metaSchema,
} = require('../../../schemas/api_v3/dryrunTransaction.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions/dryrun`;
const postTransactionEndpoint = `${baseUrlV3}/transactions`;

describe('Post dryrun transactions API', () => {
	it('Post dryrun transaction succesfully', async () => {
		const response = await api.post(
			endpoint,
			{ transaction: VALID_TRANSACTION },
		);

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dryrunTransactionResponseSchema);
		expect(response.data.events.length).toBeGreaterThan(0);
		expect(response.data.success).toBe(true);
		expect(response.meta).toMap(metaSchema);
	});

	it('Returns proper response for duplicate transaction', async () => {
		const transaction = '0a05746f6b656e12087472616e7366657218062080c2d72f2a20a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f032270a0800000000000000001080c2d72f1a1474e3ba5ade3e94451bd4de9d19917c8e6eff624d22003a40a79a869fa68e6a407f218c82ccac2b0d92dbe12fb5eafbb0e21e4fcffc7e19d8d9f0db86826e881ab6b39931e0e933dcdaa119cb7cc174f77c5529745159ec05';

		// Check dryrun passes
		const firstResponse = await api.post(
			endpoint,
			{ transaction: VALID_TRANSACTION },
		);

		expect(firstResponse).toMap(goodRequestSchema);
		expect(firstResponse.data).toMap(dryrunTransactionResponseSchema);
		expect(firstResponse.data.events.length).toBeGreaterThan(0);
		expect(firstResponse.data.success).toBe(true);
		expect(firstResponse.meta).toMap(metaSchema);

		// Send transaction and wait for it to be included in the next block
		await api.post(
			postTransactionEndpoint,
			{ transaction },
		);
		await waitMs(15000);

		// Check dry run fails for duplicate transaction
		const secondResponse = await api.post(
			endpoint,
			{ transaction },
		);

		expect(secondResponse).toMap(goodRequestSchema);
		expect(secondResponse.data).toMap(dryrunTransactionResponseSchema);
		expect(secondResponse.data.success).toBe(false);
		expect(secondResponse.data.events.length).toBe(0);
		expect(secondResponse.meta).toMap(metaSchema);
	});

	it('Throws error when posting invalid binary transaction', async () => {
		const dryrunTransaction = await api.post(
			endpoint,
			{ transaction: INVALID_TRANSACTION },
			500,
		);
		expect(dryrunTransaction).toMap(badRequestSchema);
	});

	it('No transaction -> bad request', async () => {
		const response = await api.post(endpoint, {}, 400);
		expect(response).toMap(wrongInputParamSchema);
	});

	it('Throws error in case of invalid query params', async () => {
		const dryrunTransaction = await api.post(
			endpoint,
			{
				transaction: VALID_TRANSACTION,
				transactions: INVALID_TRANSACTION,
			},
			400,
		);
		expect(dryrunTransaction).toMap(wrongInputParamSchema);
	});
});
