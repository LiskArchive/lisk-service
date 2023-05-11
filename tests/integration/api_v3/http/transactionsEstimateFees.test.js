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
const config = require('../../../config');
const { api } = require('../../../helpers/api');
const {
	TRANSACTION_OBJECT_VALID,
	TRANSACTION_ENCODED_VALID,
} = require('../constants/transactionsDryRun');

const {
	badRequestSchema,
	wrongInputParamSchema,
} = require('../../../schemas/httpGenerics.schema');

const { transactionEstimateFees } = require('../../../schemas/api_v3/transactionsEstimateFees.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions/estimate-fees`;

describe('Post estimate-fees transactions API', () => {
	it('should return transaction fees with valid transaction object', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_VALID });
		expect(response).toMap(transactionEstimateFees);
	});

	it('should return transaction fees with valid transaction object without id', async () => {
		const { id, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		const response = await api.post(endpoint, { transaction: remTransactionObject });
		expect(response).toMap(transactionEstimateFees);
	});

	it('should return transaction fees with valid transaction object without signatures', async () => {
		const { signatures, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		const response = await api.post(endpoint, { transaction: remTransactionObject });
		expect(response).toMap(transactionEstimateFees);
	});

	it('should return transaction fees with valid transaction object without fee', async () => {
		const { fee, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		const response = await api.post(endpoint, { transaction: remTransactionObject });
		expect(response).toMap(transactionEstimateFees);
	});

	it('should return bad request when called with valid transaction string', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_ENCODED_VALID }, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when called with invalid transaction', async () => {
		const response = await api.post(endpoint, { transaction: 'INVALID_TRANSACTION' }, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request when called with empty transaction', async () => {
		const response = await api.post(endpoint, {}, 400);
		expect(response).toMap(wrongInputParamSchema);
	});

	it('should return bad request when called with invalid query params', async () => {
		const response = await api.post(
			endpoint,
			{
				transactions: TRANSACTION_OBJECT_VALID,
			},
			400,
		);
		expect(response).toMap(wrongInputParamSchema);
	});
});
