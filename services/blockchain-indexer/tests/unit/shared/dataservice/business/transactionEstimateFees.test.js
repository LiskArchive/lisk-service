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
const { resolve } = require('path');

const { inputTransaction, inputMultisigTransaction } = require('../../../../constants/transactions');

const mockedFilePath = resolve(`${__dirname}/../../../../../shared/dataService/business/mainchain`);

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
		MySQL: {
			...actual.MySQL,
			KVStore: {
				...actual.KVStore,
				getKeyValueTable: jest.fn(),
			},
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
	};
});

describe('Test transaction fees estimates', () => {
	jest.mock(mockedFilePath, () => {
		const actual = jest.requireActual(mockedFilePath);
		return {
			...actual,
			resolveChannelInfo() {
				return { messageFeeTokenID: '0400000000000000' };
			},
		};
	});

	const {
		mockTransaction,
		calcDynamicFeeEstimates,
	} = require('../../../../../shared/dataService/business/transactionsEstimateFees');

	describe('Test transaction fees estimate', () => {
		const feeEstimatePerByte = { low: 0, med: 10, high: 50 };
		const minFee = 150000;
		const size = 150;

		it('should return dynamic fee estimates', async () => {
			const expectedResponse = {
				low: BigInt('150000'),
				medium: BigInt('151500'),
				high: BigInt('157500'),
			};

			const dynamicFeeEstimates = calcDynamicFeeEstimates(feeEstimatePerByte, minFee, size);
			expect(Object.getOwnPropertyNames(dynamicFeeEstimates).length).toBe(3);
			expect(dynamicFeeEstimates).toMatchObject(expectedResponse);
		});

		it('should throw error when feeEstimatePerByte is undefined', async () => {
			expect(() => {
				calcDynamicFeeEstimates(undefined, minFee, size);
			}).toThrow(TypeError);
		});

		it('should throw error when minFee is undefined', async () => {
			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, undefined, size);
			}).toThrow(TypeError);
		});

		it('should throw error when transaction size is undefined', async () => {
			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, minFee, undefined);
			}).toThrow(TypeError);
		});

		it('should throw error when feeEstimatePerByte is null', async () => {
			expect(() => {
				calcDynamicFeeEstimates(null, minFee, size);
			}).toThrow(TypeError);
		});

		it('should throw error when minFee is null', async () => {
			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, null, size);
			}).toThrow(TypeError);
		});

		it('should throw error when transaction size is null', async () => {
			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, minFee, null);
			}).toThrow(TypeError);
		});
	});

	describe('Test mockTransaction method', () => {
		const authAccountInfo = { numberOfSignatures: 0, mandatoryKeys: [], optionalKeys: [] };

		const authInfoForMultisigAccount = {
			...authAccountInfo,
			numberOfSignatures: 2,
			mandatoryKeys: [
				'4d9c2774f1c98accafb8554c164ce5689f66a32d768b64a9f694d5bd51dc1b4d',
			],
			optionalKeys: [
				'b1353e202043ead83083ce8b7eb3a9d04fb49cdcf8c73c0e81567d55d114c076',
			],
		};

		it('should return transaction when called with all valid params', async () => {
			const transaction = await mockTransaction(inputTransaction, authAccountInfo);
			expect(transaction).toMatchObject(inputTransaction);
		});

		it('should return multisignature transaction when called with all valid params', async () => {
			const transaction = await mockTransaction(
				inputMultisigTransaction,
				authInfoForMultisigAccount,
			);

			const expectedResponse = {
				...inputMultisigTransaction,
				signatures: transaction.signatures,
				id: transaction.id,
				fee: transaction.fee,
			};

			expect(transaction).toMatchObject(expectedResponse);
			expect(transaction.signatures.length).toBe(authInfoForMultisigAccount.numberOfSignatures);
		});

		it('should return transaction when called transaction without id', async () => {
			const { id, ...remParams } = inputTransaction;
			const transaction = await mockTransaction(remParams, authAccountInfo);

			const expectedResponse = {
				...inputTransaction,
				id: transaction.id,
			};

			expect(transaction).toMatchObject(expectedResponse);
		});

		it('should return transaction when called transaction without fee', async () => {
			const { fee, ...remParams } = inputTransaction;
			const transaction = await mockTransaction(remParams, authAccountInfo);

			const expectedResponse = {
				...inputTransaction,
				fee: '0',
			};

			expect(transaction).toMatchObject(expectedResponse);
		});

		it('should return multisignature transaction when called transaction without signatures', async () => {
			const { signatures, ...remParams } = inputMultisigTransaction;
			const transaction = await mockTransaction(remParams, authInfoForMultisigAccount);

			const expectedResponse = {
				...inputMultisigTransaction,
				signatures: transaction.signatures,
			};

			expect(transaction).toMatchObject(expectedResponse);
			expect(transaction.signatures.length).toBe(authInfoForMultisigAccount.numberOfSignatures);
		});

		it('should return transaction when called transaction params without messageFee', async () => {
			const { messageFee, ...remTransactionParams } = inputTransaction.params;

			const transaction = await mockTransaction(
				{ ...inputTransaction, params: remTransactionParams },
				authAccountInfo,
			);

			const expectedResponse = {
				...inputTransaction,
				params: { ...inputTransaction.params, messageFee: '0' },
			};

			expect(transaction).toMatchObject(expectedResponse);
		});

		it('should return transaction when called transaction params without messageFeeTokenID', async () => {
			const { messageFeeTokenID, ...remTransactionParams } = inputTransaction.params;

			const transaction = await mockTransaction(
				{ ...inputTransaction, params: remTransactionParams },
				authAccountInfo,
			);

			const expectedResponse = {
				...inputTransaction,
				params: { ...inputTransaction.params, messageFeeTokenID: '0400000000000000' },
			};

			expect(transaction).toMatchObject(expectedResponse);
		});

		it('should throw error when transaction is undefined', async () => {
			expect(async () => mockTransaction(undefined)).rejects.toThrow(TypeError);
		});

		it('should throw error when transaction is null', async () => {
			expect(async () => mockTransaction(null)).rejects.toThrow(TypeError);
		});
	});
});
