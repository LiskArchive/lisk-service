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
const BluebirdPromise = require('bluebird');

const config = require('../../../config');
const { api } = require('../../../helpers/api');
const {
	TRANSACTION_OBJECT_VALID,
	TRANSACTION_ENCODED_VALID,
	TOKEN_TRANSFER_TRANSACTION_OBJECT,
	AUTH_REGISTER_MULTI_SIGNATURE_TRANSACTION_OBJECT,
	POS_REGISTER_VALIDATOR_TRANSACTION_OBJECT,
	POS_UNLOCK_TRANSACTION_OBJECT,
	LEGACY_RECLAIM_LSK,
	LEGACY_REGISTER_KEYS_TRANSACTION_OBJECT,
	POS_REPORT_MISBEHAVIOR_TRANSACTION_OBJECT,
	POS_STAKE_TRANSACTION_OBJECT,
	POS_UPDATE_GENERATOR_KEY_TRANSACTION_OBJECT,
	POS_CHANGE_COMMISSION_TRANSACTION_OBJECT,
	POS_CLAIM_REWARDS_TRANSACTION_OBJECT,
} = require('../constants/transactionsDryRun');

const {
	badRequestSchema,
	wrongInputParamSchema,
} = require('../../../schemas/httpGenerics.schema');

const { transactionEstimateFees } = require('../../../schemas/api_v3/transactionsEstimateFees.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions/estimate-fees`;

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

	describe.only('Test estimate-fees transactions for all transaction types', () => {
		const transactionsMap = {
			'token:transfer': TOKEN_TRANSFER_TRANSACTION_OBJECT,
			'auth:registerMultisignature': AUTH_REGISTER_MULTI_SIGNATURE_TRANSACTION_OBJECT,
			'pos:registerValidator': POS_REGISTER_VALIDATOR_TRANSACTION_OBJECT,
			'pos:unlock': POS_UNLOCK_TRANSACTION_OBJECT,
			'pos:updateGeneratorKey': POS_UPDATE_GENERATOR_KEY_TRANSACTION_OBJECT,
			'pos:reportMisbehavior': POS_REPORT_MISBEHAVIOR_TRANSACTION_OBJECT,
			'pos:stake': POS_STAKE_TRANSACTION_OBJECT,
			'pos:changeCommission': POS_CHANGE_COMMISSION_TRANSACTION_OBJECT,
			'pos:claimRewards': POS_CLAIM_REWARDS_TRANSACTION_OBJECT,

			'legacy:reclaimLSK': LEGACY_RECLAIM_LSK,
			'legacy:registerKeys': LEGACY_REGISTER_KEYS_TRANSACTION_OBJECT,
		};

		Object
			.entries(transactionsMap)
			.forEach(([transactionType, transactionObject]) => {
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
