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
	TRANSACTION_OBJECT_VALID_WITH_REQUIRED_PROPS,
} = require('../constants/transactionsDryRun');
const { transactionsMap } = require('../constants/transactionsEstimateFees');

const { badRequestSchema, wrongInputParamSchema } = require('../../../schemas/httpGenerics.schema');

const {
	transactionEstimateFees,
} = require('../../../schemas/api_v3/transactionsEstimateFees.schema');
const { invalidAddresses, invalidPublicKeys } = require('../constants/invalidInputs');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions/estimate-fees`;

const getEntries = (o, prefix = '') =>
	Object.entries(o).flatMap(([k, v]) =>
		Object(v) === v ? getEntries(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]],
	);

const getSumOfMetaValues = meta => {
	const flattenedEntries = getEntries(meta.breakdown);
	const flattenedObject = Object.fromEntries(flattenedEntries);
	const sum = Object.values(flattenedObject).reduce((a, b) => BigInt(a) + BigInt(b), BigInt(0));
	return sum.toString();
};

describe('Post estimate-fees transactions API', () => {
	it('should return transaction fees with valid transaction object with all properties', async () => {
		const response = await api.post(endpoint, { transaction: TRANSACTION_OBJECT_VALID });
		expect(response).toMap(transactionEstimateFees);
	});

	it('should return transaction fees with valid transaction object with only required properties', async () => {
		const response = await api.post(endpoint, {
			transaction: TRANSACTION_OBJECT_VALID_WITH_REQUIRED_PROPS,
		});
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

	it('should return bad request when requested with invalid public key', async () => {
		const { senderPublicKey, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		for (let i = 0; i < invalidPublicKeys.length; i++) {
			remTransactionObject.senderPublicKey = invalidPublicKeys[i];
			const response = await api.post(endpoint, { transaction: remTransactionObject }, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	it('should return bad request when requested with invalid address', async () => {
		const { params, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		for (let i = 0; i < invalidAddresses.length; i++) {
			remTransactionObject.params = {
				...params,
				recipientAddress: invalidAddresses[i],
			};
			const response = await api.post(endpoint, { transaction: remTransactionObject }, 400);
			expect(response).toMap(badRequestSchema);
		}
	});

	describe('Test estimate-fees transactions for all transaction types', () => {
		Object.entries(transactionsMap).forEach(([transactionType, transactionObject]) => {
			it(`should return transaction fees when called with ${transactionType} transaction object`, async () => {
				const { fee, ...remTransactionObject } = transactionObject;
				const response = await api.post(endpoint, { transaction: remTransactionObject });
				expect(response).toMap(transactionEstimateFees);
				expect(getSumOfMetaValues(response.meta)).toEqual(response.data.transaction.fee.minimum);
			});
		});
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
