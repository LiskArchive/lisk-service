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

const { transactionCalculateFees } = require('../../../schemas/api_v3/transactionsCalculateFees.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions/calculate-fees`;

describe('Post calculate-fees transactions API', () => {
	it('should return transaction fees with valid transaction object', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_VALID });
		expect(response).toMap(transactionCalculateFees);
	});

	it('should return transaction fees with valid transaction string', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_ENCODED_VALID });
		expect(response).toMap(transactionCalculateFees);
	});

	it('should throw error in case of invalid transaction', async () => {
		const response = await api.post(endpoint, { transaction: 'INVALID_TRANSACTION' }, 500);
		expect(response).toMap(badRequestSchema);
	});

	it('No transaction -> bad request', async () => {
		const response = await api.post(endpoint, {}, 400);
		expect(response).toMap(wrongInputParamSchema);
	});

	it('Returns error in case of invalid query params', async () => {
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
