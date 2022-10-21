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
const config = require('../../../config');
const { api } = require('../../../helpers/api');
const { VALID_TRANSACTION, INVALID_TRANSACTION } = require('../constants/dryRunTransactions');

const {
	badRequestSchema,
	wrongInputParamSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	goodRequestSchema,
	dryrunTransactionSchema,
	metaSchema,
} = require('../../../schemas/api_v3/dryrunTransaction.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions/dryrun`;

describe('Post dryrun transactions API', () => {
	it('Post dryrun transaction succesfully', async () => {
		const response = await api.post(
			endpoint,
			{ transaction: VALID_TRANSACTION },
		);

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dryrunTransactionSchema);
		expect(response.meta).toMap(metaSchema);
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
