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
/* eslint-disable import/no-dynamic-require */
const { resolve } = require('path');

const { inputTransaction, inputMultisigTransaction } = require('../../../../constants/transactions');

const mockedMainchainFilePath = resolve(`${__dirname}/../../../../../shared/dataService/business/mainchain`);
const mockedTransactionFeeEstimatesFilePath = resolve(`${__dirname}/../../../../../shared/dataService/business/transactionsEstimateFees`);
const mockedAuthFilePath = resolve(`${__dirname}/../../../../../shared/dataService/business/auth`);
const mockedAccountFilePath = resolve(`${__dirname}/../../../../../shared/utils/account`);
const mockedRequestFilePath = resolve(`${__dirname}/../../../../../shared/utils/request`);
const mockedPOSConstantsFilePath = resolve(`${__dirname}/../../../../../shared/dataService/pos/constants`);
const mockedFeeEstimateFilePath = resolve(`${__dirname}/../../../../../shared/dataService/business/feeEstimates`);

const { mockTxRequest, mockTxResult, mockTxsenderAddress, mockTxAuthAccountInfo, mockTxrequestConnector, posConstants, mockTxFeeEstimate } = require('../../constants/transactionEstimateFees');

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
	jest.mock(mockedMainchainFilePath, () => {
		const actual = jest.requireActual(mockedMainchainFilePath);
		return {
			...actual,
			resolveChannelInfo() {
				return { messageFeeTokenID: '0400000000000000' };
			},
		};
	});

	describe('Test transaction fees estimate', () => {
		const feeEstimatePerByte = { low: 0, med: 10, high: 50 };
		const minFee = 150000;
		const size = 150;

		it('should return dynamic fee estimates', async () => {
			const {
				calcDynamicFeeEstimates,
			} = require(mockedTransactionFeeEstimatesFilePath);

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
			const {
				calcDynamicFeeEstimates,
			} = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(undefined, minFee, size);
			}).toThrow(TypeError);
		});

		it('should throw error when minFee is undefined', async () => {
			const {
				calcDynamicFeeEstimates,
			} = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, undefined, size);
			}).toThrow(TypeError);
		});

		it('should throw error when transaction size is undefined', async () => {
			const {
				calcDynamicFeeEstimates,
			} = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, minFee, undefined);
			}).toThrow(TypeError);
		});

		it('should throw error when feeEstimatePerByte is null', async () => {
			const {
				calcDynamicFeeEstimates,
			} = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(null, minFee, size);
			}).toThrow(TypeError);
		});

		it('should throw error when minFee is null', async () => {
			const {
				calcDynamicFeeEstimates,
			} = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, null, size);
			}).toThrow(TypeError);
		});

		it('should throw error when transaction size is null', async () => {
			const {
				calcDynamicFeeEstimates,
			} = require(mockedTransactionFeeEstimatesFilePath);

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
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

			const transaction = await mockTransaction(inputTransaction, authAccountInfo);
			expect(transaction).toMatchObject(inputTransaction);
		});

		it('should return multisignature transaction when called with all valid params', async () => {
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

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
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

			const { id, ...remParams } = inputTransaction;
			const transaction = await mockTransaction(remParams, authAccountInfo);

			const expectedResponse = {
				...inputTransaction,
				id: transaction.id,
			};

			expect(transaction).toMatchObject(expectedResponse);
		});

		it('should return transaction when called transaction without fee', async () => {
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

			const { fee, ...remParams } = inputTransaction;
			const transaction = await mockTransaction(remParams, authAccountInfo);

			const expectedResponse = {
				...inputTransaction,
				fee: '0',
			};

			expect(transaction).toMatchObject(expectedResponse);
		});

		it('should return multisignature transaction when called transaction without signatures', async () => {
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

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
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

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
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

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
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

			expect(async () => mockTransaction(undefined)).rejects.toThrow(TypeError);
		});

		it('should throw error when transaction is null', async () => {
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

			expect(async () => mockTransaction(null)).rejects.toThrow(TypeError);
		});
	});

	describe('estimateTransactionFees', () => {
		// Mock the dependencies
		const { calcAccountInitializationFees }	= require(mockedTransactionFeeEstimatesFilePath);
		const { calcMessageFee } = require(mockedTransactionFeeEstimatesFilePath);
		const { getAuthAccountInfo } = require(mockedAuthFilePath);
		const { getLisk32AddressFromPublicKey } = require(mockedAccountFilePath);
		const { requestConnector } = require(mockedRequestFilePath);
		const { getPosConstants } = require(mockedPOSConstantsFilePath);
		const { getFeeEstimates } = require(mockedFeeEstimateFilePath);

		jest.mock(mockedAuthFilePath, () => ({
			getAuthAccountInfo: jest.fn(),
		}));

		jest.mock(mockedFeeEstimateFilePath, () => ({
			getFeeEstimates: jest.fn(),
		}));

		jest.mock(mockedAccountFilePath, () => ({
			getLisk32AddressFromPublicKey: jest.fn(),
		}));

		jest.mock(mockedTransactionFeeEstimatesFilePath, () => {
			const actual = jest.requireActual(mockedTransactionFeeEstimatesFilePath);

			return {
				...actual,
				calcAccountInitializationFees: jest.fn(),
				calcMessageFee: jest.fn(),
			};
		});

		jest.mock(mockedRequestFilePath, () => ({
			requestConnector: jest.fn(),
			requestFeeEstimator: jest.fn(),
		}));

		jest.mock(mockedPOSConstantsFilePath, () => ({
			getPosConstants: jest.fn(),
		}));

		it('should calculate transaction fees correctly', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector.mockResolvedValue(mockTxrequestConnector);
			getFeeEstimates.mockResolvedValue(mockTxFeeEstimate);
			calcAccountInitializationFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			const result = await estimateTransactionFees(mockTxRequest);
			expect(result).toEqual(mockTxResult);
		});

		it('should throw if empty, undefined or null object is passed', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector.mockResolvedValue(mockTxrequestConnector);
			getFeeEstimates.mockResolvedValue(mockTxFeeEstimate);
			calcAccountInitializationFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			await expect(estimateTransactionFees({})).rejects.toBeTruthy();
			await expect(estimateTransactionFees(undefined)).rejects.toBeTruthy();
			await expect(estimateTransactionFees(null)).rejects.toBeTruthy();
		});

		it('should throw when getAuthAccountInfo fails', async () => {
			getAuthAccountInfo.mockRejectedValue('Error');

			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			requestConnector.mockResolvedValue(mockTxrequestConnector);
			getFeeEstimates.mockResolvedValue(mockTxFeeEstimate);
			calcAccountInitializationFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);
			await expect(estimateTransactionFees(mockTxRequest)).rejects.toBeTruthy();
		});

		it('rshould throw when requestConnector fails', async () => {
			requestConnector.mockRejectedValue('Error');

			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			getFeeEstimates.mockResolvedValue(mockTxFeeEstimate);
			calcAccountInitializationFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);
			await expect(estimateTransactionFees(mockTxRequest)).rejects.toBeTruthy();
		});

		it('should throw when getFeeEstimates fails', async () => {
			getFeeEstimates.mockRejectedValue('Error');

			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector.mockResolvedValue(mockTxrequestConnector);
			calcAccountInitializationFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);
			await expect(estimateTransactionFees(mockTxRequest)).rejects.toBeTruthy();
		});
	});
});
