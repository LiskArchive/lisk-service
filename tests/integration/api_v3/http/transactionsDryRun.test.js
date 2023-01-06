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
const {
	TRANSACTION_OBJECT_VALID,
	TRANSACTION_OBJECT_INVALID,
	TRANSACTION_OBJECT_FAIL,
	TRANSACTION_ENCODED_VALID,
	TRANSACTION_ENCODED_FAIL,
	TRANSACTION_ENCODED_INVALID,
} = require('../constants/transactionsDryRun');
const { waitMs } = require('../../../helpers/utils');

const {
	badRequestSchema,
	wrongInputParamSchema,
	goodRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	dryrunTransactionSuccessResponseSchema,
	dryrunTransactionInvalidResponseSchema,
	dryrunTransactionFailResponseSchema,
	metaSchema,
} = require('../../../schemas/api_v3/transactionsDryRun.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions/dryrun`;
const postTransactionEndpoint = `${baseUrlV3}/transactions`;

describe('Post dryrun transactions API', () => {
	it('Returns proper response (Fail) when transaction object has less than required fee', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_FAIL });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dryrunTransactionFailResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('Returns proper response (Fail) when transaction string has less than required fee', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_ENCODED_FAIL });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dryrunTransactionFailResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('Post dryrun transaction succesfully with only transaction object', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_VALID });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('Post dryrun transaction succesfully with only transaction string', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_ENCODED_VALID });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('Post dryrun transaction succesfully with only transaction skipping verification', async () => {
		const response = await api.post(
			endpoint,
			{ transaction: TRANSACTION_OBJECT_VALID, isSkipVerify: true },
		);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(response.data.events.length).toBeGreaterThan(0);
		expect(response.meta).toMap(metaSchema);
	});

	it('Returns proper response (Invalid) when transaction string has less than minimum required fee', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_ENCODED_INVALID });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dryrunTransactionInvalidResponseSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('Returns proper response (Invalid) for duplicate transaction', async () => {
		// Check dryrun passes
		const firstResponse = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_VALID });
		expect(firstResponse).toMap(goodRequestSchema);
		expect(firstResponse.data).toMap(dryrunTransactionSuccessResponseSchema);
		expect(firstResponse.data.events.length).toBeGreaterThan(0);
		expect(firstResponse.meta).toMap(metaSchema);

		// Send transaction and wait for it to be included in the next block
		await api.post(postTransactionEndpoint, { transaction: TRANSACTION_ENCODED_VALID });
		await waitMs(15000);

		// Check dry run fails for duplicate transaction
		const secondResponse = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_VALID });
		expect(secondResponse).toMap(goodRequestSchema);
		expect(secondResponse.data).toMap(dryrunTransactionInvalidResponseSchema);
		expect(secondResponse.data.events.length).toBe(0);
		expect(secondResponse.meta).toMap(metaSchema);
	});

	it('Returns proper response (Invalid) when posting invalid transaction', async () => {
		const dryrunTransaction = await api.post(
			endpoint,
			{ transaction: TRANSACTION_OBJECT_INVALID },
			500,
		);
		expect(dryrunTransaction).toMap(badRequestSchema);
	});

	it('No transaction -> bad request', async () => {
		const response = await api.post(endpoint, {}, 400);
		expect(response).toMap(wrongInputParamSchema);
	});

	it('Returns error in case of invalid query params', async () => {
		const dryrunTransaction = await api.post(
			endpoint,
			{
				transaction: TRANSACTION_OBJECT_VALID,
				transactions: TRANSACTION_OBJECT_INVALID,
			},
			400,
		);
		expect(dryrunTransaction).toMap(wrongInputParamSchema);
	});
});
