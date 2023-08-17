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
const {
	TRANSACTION_OBJECT_VALID,
	TRANSACTION_ENCODED_VALID,
	TRANSACTION_OBJECT_VALID_WITH_REQUIRED_PROPS,
} = require('../constants/transactionsDryRun');
const { transactionsMap } = require('../constants/transactionsEstimateFees');

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
	emptyResponseSchema,
} = require('../../../schemas/rpcGenerics.schema');

const { transactionEstimateFees } = require('../../../schemas/api_v3/transactionsEstimateFees.schema');
const { invalidPublicKeys, invalidAddresses } = require('../constants/invalidInputs');

const getEntries = (o, prefix = '') => Object
	.entries(o)
	.flatMap(
		([k, v]) => Object(v) === v ? getEntries(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]],
	);

const getSumOfMetaValues = (meta) => {
	const flattenedEntries = getEntries(meta.breakdown);
	const flattenedObject = Object.fromEntries(flattenedEntries);
	const sum = Object
		.values(flattenedObject)
		.reduce((a, b) => BigInt(a) + BigInt(b), BigInt(0));
	return sum.toString();
};

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const calculateTransactionFees = async params => request(wsRpcUrl, 'post.transactions.estimate-fees', params);

describe('Method post.transactions.estimate-fees', () => {
	it('should return transaction fees when called with valid transaction object with all properties', async () => {
		const response = await calculateTransactionFees({ transaction: TRANSACTION_OBJECT_VALID });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(transactionEstimateFees);
	});

	it('should return transaction fees when called with valid transaction object with only required properties', async () => {
		const response = await calculateTransactionFees({
			transaction: TRANSACTION_OBJECT_VALID_WITH_REQUIRED_PROPS,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(transactionEstimateFees);
	});

	it('should return transaction fees when called with valid transaction object without id', async () => {
		const { id, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		const response = await calculateTransactionFees({ transaction: remTransactionObject });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(transactionEstimateFees);
	});

	it('should return transaction fees when called with valid transaction object without signatures', async () => {
		const { signatures, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		const response = await calculateTransactionFees({ transaction: remTransactionObject });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(transactionEstimateFees);
	});

	it('should return transaction fees when called with valid transaction object without fee', async () => {
		const { fee, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		const response = await calculateTransactionFees({ transaction: remTransactionObject });
		expect(response).toMap(jsonRpcEnvelopeSchema);

		const { result } = response;
		expect(result).toMap(transactionEstimateFees);
	});

	it('should return invalid param when requested with invalid public key', async () => {
		const { senderPublicKey, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		for (let i = 0; i < invalidPublicKeys.length; i++) {
			remTransactionObject.senderPublicKey = invalidPublicKeys[i];
			// eslint-disable-next-line no-await-in-loop
			const response = await calculateTransactionFees({ transaction: remTransactionObject });
			expect(response).toMap(invalidParamsSchema);
		}
	});

	it('should return empty response when requested with invalid address', async () => {
		const { params, ...remTransactionObject } = TRANSACTION_OBJECT_VALID;
		for (let i = 0; i < invalidAddresses.length; i++) {
			remTransactionObject.params = {
				...params,
				recipientAddress: invalidAddresses[i],
			};
			// eslint-disable-next-line no-await-in-loop
			const response = await calculateTransactionFees({ transaction: remTransactionObject });
			expect(response).toMap(emptyResponseSchema);
		}
	});

	describe('Test estimate-fees transactions for all transaction types', () => {
		Object
			.entries(transactionsMap)
			.forEach(([transactionType, transactionObject]) => {
				it(`should return transaction fees when called with ${transactionType} transaction object`, async () => {
					const { fee, ...remTransactionObject } = transactionObject;
					const response = await calculateTransactionFees({ transaction: remTransactionObject });
					const { result } = response;
					expect(result).toMap(transactionEstimateFees);
					expect(getSumOfMetaValues(result.meta)).toEqual(result.data.transaction.fee.minimum);
				});
			});
	});

	it('should return invalid params when called with valid transaction string', async () => {
		const response = await calculateTransactionFees({ transaction: TRANSACTION_ENCODED_VALID });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params when called with invalid transaction', async () => {
		const response = await calculateTransactionFees({ transaction: 'INVALID_TRANSACTION' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params when called with no params', async () => {
		const response = await calculateTransactionFees();
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return invalid params when called with invalid query params', async () => {
		const response = await calculateTransactionFees({ transactions: TRANSACTION_OBJECT_VALID });
		expect(response).toMap(invalidParamsSchema);
	});
});
