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

const {
	inputTransaction,
	inputMultisigTransaction,
} = require('../../../../constants/transactions');

const mockedChannelFilePath = resolve(
	`${__dirname}/../../../../../shared/dataService/business/interoperability/channel`,
);
const mockedTransactionFeeEstimatesFilePath = resolve(
	`${__dirname}/../../../../../shared/dataService/business/transactionsEstimateFees`,
);
const mockedAuthFilePath = resolve(`${__dirname}/../../../../../shared/dataService/business/auth`);
const mockedAccountFilePath = resolve(`${__dirname}/../../../../../shared/utils/account`);
const mockedRequestFilePath = resolve(`${__dirname}/../../../../../shared/utils/request`);
const mockedPOSConstantsFilePath = resolve(
	`${__dirname}/../../../../../shared/dataService/pos/constants`,
);
const mockedFeeEstimateFilePath = resolve(
	`${__dirname}/../../../../../shared/dataService/business/feeEstimates`,
);
const mockedNetworkFilePath = resolve(
	`${__dirname}/../../../../../shared/dataService/business/network`,
);

const {
	mockTxRequest,
	mockTxResult,
	mockTxSenderAddress,
	mockTxAuthAccountInfo,
	mockTxRequestConnector,
	posConstants,
	mockTxFeeEstimate,
	mockTransferCrossChainTxRequest,
	mockTransferCrossChainTxRequestConnector,
	mockTransferCrossChainTxResult,
	mockEscrowAccountExistsRequestConnector,
	mockInteroperabilitySubmitMainchainCrossChainUpdateTxRequest,
	mockInteroperabilitySubmitMainchainCrossChainUpdateTxResult,
	mockInteroperabilityRegisterSidechainTxRequest,
	mockInteroperabilityRegisterSidechainTxResult,
	mockAuthAccountInfo,
	mockAuthInfoForMultisigAccount,
	mockRegisterValidatorTxRequestConnector,
	mockRegisterValidatorTxResult,
} = require('../../constants/transactionEstimateFees');

const { tokenHasUserAccount } = require('../../../../../shared/dataService/business/token');

const {
	dryRunTransactions,
} = require('../../../../../shared/dataService/business/transactionsDryRun');

const { requestConnector } = require('../../../../../shared/utils/request');

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
		DB: {
			...actual.DB,
			MySQL: {
				...actual.DB.MySQL,
				KVStore: {
					...actual.DB.MySQL.KVStore,
					getKeyValueTable: jest.fn(),
				},
			},
		},
		HTTP: {
			get: jest.fn(url => {
				if (url.includes('/api/v3/blockchain/apps/meta')) {
					return Promise.resolve({
						data: {
							data: [
								{
									serviceURLs: [
										{
											http: 'http://mock-service.com',
											ws: 'ws://mock-service.com',
										},
									],
								},
							],
						},
					});
				}
				if (url.includes('/token/account/exists')) {
					return Promise.resolve({
						data: {
							data: { isExists: false },
						},
					});
				}
				if (url.includes('api/v3/token/constants')) {
					return Promise.resolve({
						data: {
							data: {
								extraCommandFees: {
									userAccountInitializationFee: '1',
									escrowAccountInitializationFee: '1',
								},
							},
						},
					});
				}

				return Promise.reject();
			}),
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
	};
});

jest.mock('../../../../../shared/dataService/business/schemas', () => {
	const { schemas } = require('../../../../constants/schemas');
	return {
		getSchemas() {
			return schemas;
		},
	};
});

jest.mock('../../../../../shared/dataService/business/token', () => ({
	tokenHasUserAccount: jest.fn().mockImplementation(() => ({
		data: { isExists: true },
		meta: {},
	})),
	getTokenConstants: jest.fn().mockImplementation(() => ({
		data: {
			extraCommandFees: {
				userAccountInitializationFee: '5000000',
				escrowAccountInitializationFee: '5000000',
			},
		},
		meta: {},
	})),
	getTokenBalances: jest.fn().mockImplementation(() => ({
		data: [{ availableBalance: '500000000000' }],
		meta: {},
	})),
}));

jest.mock('../../../../../shared/dataService/business/transactionsDryRun', () => ({
	dryRunTransactions: jest.fn(),
}));

jest.mock('../../../../../shared/utils/request', () => ({
	requestConnector: jest.fn(),
}));

describe('getCcmBuffer', () => {
	it('should return null if the transaction is not token transferCrossChain', async () => {
		const { getCcmBuffer } = require(mockedTransactionFeeEstimatesFilePath);
		expect(getCcmBuffer(mockRegisterValidatorTxRequestConnector.transaction)).resolves.toBeNull();
	});

	it('should return ccmbuffer if the transaction is transferCrossChain with CCM success event', async () => {
		requestConnector.mockResolvedValue('CCM buffer');
		dryRunTransactions.mockReturnValueOnce({
			data: { events: [{ name: 'ccmSendSuccess', data: { ccm: 'hello' } }] },
		});

		const { getCcmBuffer } = require(mockedTransactionFeeEstimatesFilePath);
		expect(() => getCcmBuffer(mockTransferCrossChainTxRequestConnector)).not.toThrow();
	});

	it('should throw validation error if the transaction is transferCrossChain without CCM success event', async () => {
		const mockErrorMessage = 'validation Error';
		requestConnector.mockResolvedValue('CCM buffer');
		dryRunTransactions
			.mockReturnValueOnce({
				data: { events: [] },
			})
			.mockReturnValueOnce({
				data: { errorMessage: mockErrorMessage },
			});

		const { getCcmBuffer } = require(mockedTransactionFeeEstimatesFilePath);
		expect(() => getCcmBuffer(mockTransferCrossChainTxRequestConnector)).rejects.toThrow(
			mockErrorMessage,
		);
	});

	it('should throw validation error if the transaction is transferCrossChain with CCM success failed', async () => {
		requestConnector.mockResolvedValue('CCM buffer');
		dryRunTransactions
			.mockReturnValueOnce({
				data: { events: [{ name: 'ccmSentFailed', code: 1 }] },
			})
			.mockReturnValueOnce({
				data: { events: [{ name: 'ccmSentFailed', code: 1 }] },
			});

		const { getCcmBuffer } = require(mockedTransactionFeeEstimatesFilePath);
		expect(() => getCcmBuffer(mockTransferCrossChainTxRequestConnector)).rejects.toThrow();
	});

	it('should return empty buffer if the transaction is transferCrossChain without CCM success failed', async () => {
		requestConnector.mockResolvedValue('CCM buffer');
		dryRunTransactions
			.mockReturnValueOnce({
				data: { events: [] },
			})
			.mockReturnValueOnce({
				data: { events: [] },
			});

		const { getCcmBuffer } = require(mockedTransactionFeeEstimatesFilePath);
		await expect(getCcmBuffer(mockTransferCrossChainTxRequestConnector)).resolves.toStrictEqual(
			Buffer.from('', 'hex'),
		);
	});
});

describe('validateUserHasTokenAccount', () => {
	it('should return undefined if user has token account initialized', () => {
		const { validateUserHasTokenAccount } = require(mockedTransactionFeeEstimatesFilePath);
		const { tokenID, recipientAddress } = mockTransferCrossChainTxRequest.transaction.params;

		expect(validateUserHasTokenAccount(tokenID, recipientAddress)).resolves.toBeUndefined();
	});

	it("should throw an error if user doesn't have token account initialized", async () => {
		tokenHasUserAccount.mockReturnValueOnce({
			data: { isExists: false },
			meta: {},
		});

		const { validateUserHasTokenAccount } = require(mockedTransactionFeeEstimatesFilePath);
		const { tokenID, recipientAddress } = mockTransferCrossChainTxRequest.transaction.params;

		await expect(validateUserHasTokenAccount(tokenID, recipientAddress)).rejects.toThrow();
	});
});

describe('validateTransactionParams', () => {
	it('should validate a valid token and register validator transaction', () => {
		const { validateTransactionParams } = require(mockedTransactionFeeEstimatesFilePath);

		expect(() =>
			validateTransactionParams(mockTransferCrossChainTxRequest.transaction),
		).not.toThrow();

		expect(() =>
			validateTransactionParams(mockRegisterValidatorTxRequestConnector.transaction),
		).not.toThrow();
	});

	it('should validate a valid token cross chain transfer transaction if passed without optional params', () => {
		const { validateTransactionParams } = require(mockedTransactionFeeEstimatesFilePath);

		const { messageFee, messageFeeTokenID, ...remParams } =
			mockTransferCrossChainTxRequest.transaction.params;

		expect(() =>
			validateTransactionParams({
				...mockTransferCrossChainTxRequest.transaction,
				params: {
					...remParams,
				},
			}),
		).not.toThrow();
	});

	it('should throw an error for incorrect tokenID in token transaction', () => {
		const { tokenID, recipientAddress, ...remParams } =
			mockTransferCrossChainTxRequest.transaction.params;

		const { validateTransactionParams } = require(mockedTransactionFeeEstimatesFilePath);

		expect(() =>
			validateTransactionParams({
				...mockTransferCrossChainTxRequest.transaction,
				params: {
					...remParams,
					tokenID: 'invalidTokenID',
					recipientAddress,
				},
			}),
		).rejects.toThrow();
	});

	it('should throw an error for incorrect recipientAddress in token transaction', () => {
		const { tokenID, recipientAddress, ...remParams } =
			mockTransferCrossChainTxRequest.transaction.params;

		const { validateTransactionParams } = require(mockedTransactionFeeEstimatesFilePath);

		expect(() =>
			validateTransactionParams({
				...mockTransferCrossChainTxRequest.transaction,
				params: {
					...remParams,
					tokenID,
					recipientAddress: 'invalidRecipientAddress',
				},
			}),
		).rejects.toThrow();
	});

	it('should throw an error for incorrect blsKey in register validator transaction', () => {
		const { blsKey, proofOfPossession, generatorKey, ...remParams } =
			mockRegisterValidatorTxRequestConnector.transaction.params;

		const { validateTransactionParams } = require(mockedTransactionFeeEstimatesFilePath);

		expect(() =>
			validateTransactionParams({
				...mockRegisterValidatorTxRequestConnector.transaction,
				params: {
					...remParams,
					blsKey: 'invalidBLSKey',
					proofOfPossession,
					generatorKey,
				},
			}),
		).rejects.toThrow();
	});

	it('should throw an error for incorrect proofOfPossession in register validator transaction', () => {
		const { blsKey, proofOfPossession, generatorKey, ...remParams } =
			mockRegisterValidatorTxRequestConnector.transaction.params;

		const { validateTransactionParams } = require(mockedTransactionFeeEstimatesFilePath);

		expect(() =>
			validateTransactionParams({
				...mockRegisterValidatorTxRequestConnector.transaction,
				params: {
					...remParams,
					blsKey,
					proofOfPossession: 'invalidProofOfPossession',
					generatorKey,
				},
			}),
		).rejects.toThrow();
	});

	it('should throw an error for incorrect generatorKey in register validator transaction', () => {
		const { blsKey, proofOfPossession, generatorKey, ...remParams } =
			mockRegisterValidatorTxRequestConnector.transaction.params;

		const { validateTransactionParams } = require(mockedTransactionFeeEstimatesFilePath);

		expect(() =>
			validateTransactionParams({
				...mockRegisterValidatorTxRequestConnector.transaction,
				params: {
					...remParams,
					blsKey,
					proofOfPossession,
					generatorKey: 'invalidGeneratorKey',
				},
			}),
		).rejects.toThrow();
	});

	it('should throw an error for incorrect sendingChainID in cross chain update transaction', () => {
		const { sendingChainID, ...remParams } =
			mockInteroperabilitySubmitMainchainCrossChainUpdateTxRequest.transaction.params;

		const { validateTransactionParams } = require(mockedTransactionFeeEstimatesFilePath);

		expect(() =>
			validateTransactionParams({
				...mockInteroperabilitySubmitMainchainCrossChainUpdateTxRequest.transaction,
				params: {
					...remParams,
					sendingChainID: 'invalidSendingChainID',
				},
			}),
		).rejects.toThrow();
	});

	it('should throw an error if user has insufficient balance transaction', () => {
		const { sendingChainID, ...remParams } =
			mockInteroperabilitySubmitMainchainCrossChainUpdateTxRequest.transaction.params;

		const { validateTransactionParams } = require(mockedTransactionFeeEstimatesFilePath);

		expect(() =>
			validateTransactionParams({
				...mockInteroperabilitySubmitMainchainCrossChainUpdateTxRequest.transaction,
				params: {
					...remParams,
					amount: Number.MAX_SAFE_INTEGER.toString(),
				},
			}),
		).rejects.toThrow();
	});
});

describe('Test transaction fees estimates', () => {
	jest.mock(mockedChannelFilePath, () => {
		const actual = jest.requireActual(mockedChannelFilePath);
		return {
			...actual,
			resolveChannelInfo() {
				return { messageFeeTokenID: '0400000000000000', minReturnFeePerByte: '1000' };
			},
			resolveMainchainServiceURL() {
				return 'http://mock-service.com';
			},
		};
	});

	describe('Test calcDynamicFeeEstimates method', () => {
		const feeEstimatePerByte = {
			low: 3.3066625382716053,
			med: 3.307093037235057,
			high: 4.366180864805574,
		};
		const minFee = 150000;
		const size = 150;

		it('should return dynamic fee estimates', async () => {
			const { calcDynamicFeeEstimates } = require(mockedTransactionFeeEstimatesFilePath);

			const expectedResponse = {
				low: BigInt('150496'),
				medium: BigInt('150496'),
				high: BigInt('150655'),
			};

			const dynamicFeeEstimates = calcDynamicFeeEstimates(feeEstimatePerByte, minFee, size);

			expect(Object.getOwnPropertyNames(dynamicFeeEstimates).length).toBe(3);
			expect(dynamicFeeEstimates).toMatchObject(expectedResponse);
		});

		it('should throw error when feeEstimatePerByte is undefined', async () => {
			const { calcDynamicFeeEstimates } = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(undefined, minFee, size);
			}).toThrow();
		});

		it('should throw error when feeEstimatePerByte is null', async () => {
			const { calcDynamicFeeEstimates } = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(null, minFee, size);
			}).toThrow();
		});

		it('should throw error when minFee is undefined', async () => {
			const { calcDynamicFeeEstimates } = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, undefined, size);
			}).toThrow();
		});

		it('should throw error when minFee is null', async () => {
			const { calcDynamicFeeEstimates } = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, null, size);
			}).toThrow();
		});

		it('should throw error when transaction size is undefined', async () => {
			const { calcDynamicFeeEstimates } = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, minFee, undefined);
			}).toThrow();
		});

		it('should throw error when transaction size is null', async () => {
			const { calcDynamicFeeEstimates } = require(mockedTransactionFeeEstimatesFilePath);

			expect(() => {
				calcDynamicFeeEstimates(feeEstimatePerByte, minFee, null);
			}).toThrow();
		});
	});

	describe('Test mockTransaction method', () => {
		const authAccountInfo = { numberOfSignatures: 0, mandatoryKeys: [], optionalKeys: [] };

		const authInfoForMultisigAccount = {
			...authAccountInfo,
			numberOfSignatures: 2,
			mandatoryKeys: ['4d9c2774f1c98accafb8554c164ce5689f66a32d768b64a9f694d5bd51dc1b4d'],
			optionalKeys: ['b1353e202043ead83083ce8b7eb3a9d04fb49cdcf8c73c0e81567d55d114c076'],
		};

		it('should return transaction when called with all valid params', async () => {
			const { mockTransaction } = require(mockedTransactionFeeEstimatesFilePath);

			const transaction = await mockTransaction(
				inputTransaction,
				authAccountInfo.numberOfSignatures,
			);
			expect(transaction).toMatchObject(inputTransaction);
		});

		it('should return multisignature transaction when called with all valid params', async () => {
			const { mockTransaction } = require(mockedTransactionFeeEstimatesFilePath);

			const transaction = await mockTransaction(
				inputMultisigTransaction,
				authInfoForMultisigAccount.numberOfSignatures,
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
			const { mockTransaction } = require(mockedTransactionFeeEstimatesFilePath);

			const { id, ...remParams } = inputTransaction;
			const transaction = await mockTransaction(remParams, authAccountInfo.numberOfSignatures);

			const expectedResponse = {
				...inputTransaction,
				id: transaction.id,
			};

			expect(transaction).toMatchObject(expectedResponse);
		});

		it('should return transaction when called transaction without fee', async () => {
			const { mockTransaction } = require(mockedTransactionFeeEstimatesFilePath);

			const { fee, ...remParams } = inputTransaction;
			const transaction = await mockTransaction(remParams, authAccountInfo.numberOfSignatures);

			const expectedResponse = {
				...inputTransaction,
				fee: '0',
			};

			expect(transaction).toMatchObject(expectedResponse);
		});

		it('should return multisignature transaction when called transaction without signatures', async () => {
			const { mockTransaction } = require(mockedTransactionFeeEstimatesFilePath);

			const { signatures, ...remParams } = inputMultisigTransaction;
			const transaction = await mockTransaction(
				remParams,
				authInfoForMultisigAccount.numberOfSignatures,
			);

			const expectedResponse = {
				...inputMultisigTransaction,
				signatures: transaction.signatures,
			};

			expect(transaction).toMatchObject(expectedResponse);
			expect(transaction.signatures.length).toBe(authInfoForMultisigAccount.numberOfSignatures);
		});

		it('should return transaction when called transaction params without messageFee', async () => {
			const { mockTransaction } = require(mockedTransactionFeeEstimatesFilePath);

			const { messageFee, ...remTransactionParams } = inputTransaction.params;

			const transaction = await mockTransaction(
				{ ...inputTransaction, params: remTransactionParams },
				authAccountInfo.numberOfSignatures,
			);

			const expectedResponse = {
				...inputTransaction,
				params: { ...inputTransaction.params, messageFee: '0' },
			};

			expect(transaction).toMatchObject(expectedResponse);
		});

		it('should return transaction when called transaction params without messageFeeTokenID', async () => {
			const { mockTransaction } = require(mockedTransactionFeeEstimatesFilePath);

			const { messageFeeTokenID, ...remTransactionParams } = inputTransaction.params;

			const transaction = await mockTransaction(
				{ ...inputTransaction, params: remTransactionParams },
				authAccountInfo.numberOfSignatures,
			);

			const expectedResponse = {
				...inputTransaction,
				params: { ...inputTransaction.params, messageFeeTokenID: '0400000000000000' },
			};

			expect(transaction).toMatchObject(expectedResponse);
		});

		it('should throw error when transaction is undefined', async () => {
			const { mockTransaction } = require(mockedTransactionFeeEstimatesFilePath);

			expect(async () => mockTransaction(undefined)).rejects.toThrow();
		});

		it('should throw error when transaction is null', async () => {
			const { mockTransaction } = require(mockedTransactionFeeEstimatesFilePath);

			expect(async () => mockTransaction(null)).rejects.toThrow();
		});
	});

	describe('Test estimateTransactionFees method', () => {
		// Mock the dependencies
		const { calcAdditionalFees } = require(mockedTransactionFeeEstimatesFilePath);
		const { calcMessageFee } = require(mockedTransactionFeeEstimatesFilePath);
		const { getAuthAccountInfo } = require(mockedAuthFilePath);
		const { getLisk32AddressFromPublicKey } = require(mockedAccountFilePath);
		const { getPosConstants } = require(mockedPOSConstantsFilePath);
		const { getFeeEstimates } = require(mockedFeeEstimateFilePath);
		const { getNetworkStatus } = require(mockedNetworkFilePath);

		jest.mock(mockedAuthFilePath, () => ({
			getAuthAccountInfo: jest.fn(),
		}));

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
				calcAdditionalFees: jest.fn(),
				calcMessageFee: jest.fn(),
			};
		});

		jest.mock(mockedPOSConstantsFilePath, () => ({
			getPosConstants: jest.fn(),
		}));

		jest.mock(mockedNetworkFilePath, () => ({
			getNetworkStatus: jest.fn(),
		}));

		it('should calculate transaction fees correctly', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxSenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector
				.mockReturnValueOnce(mockTxRequestConnector)
				.mockReturnValue({ userAccount: '1', escrowAccount: '0', minFee: '130000', size: 160 });
			getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			const result = await estimateTransactionFees(mockTxRequest);
			expect(result).toEqual(mockTxResult);
		});

		it('should calculate transaction fees correctly for transfer cross chain transaction', async () => {
			// Mock the return values of the functions
			dryRunTransactions.mockReturnValue({
				data: { events: [{ name: 'ccmSendSuccess', data: { ccm: 'hello' } }] },
			});
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxSenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector
				.mockReturnValueOnce(mockAuthAccountInfo)
				.mockReturnValueOnce(mockEscrowAccountExistsRequestConnector)
				.mockReturnValueOnce(mockTransferCrossChainTxRequestConnector)
				.mockReturnValueOnce('encoded CCM Object')
				.mockReturnValueOnce(mockTransferCrossChainTxRequestConnector);
			getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);
			getNetworkStatus.mockResolvedValue({ data: { chainID: '02000000' } });

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			const result = await estimateTransactionFees(mockTransferCrossChainTxRequest);
			expect(result).toEqual(mockTransferCrossChainTxResult);
		});

		it('should calculate transaction fees correctly for register validator transaction', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxSenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector
				.mockReturnValueOnce(mockAuthAccountInfo)
				.mockReturnValue({ validatorRegistrationFee: '1', minFee: '130000', size: 160 });
			getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);
			getNetworkStatus.mockResolvedValue({ data: { chainID: '04000000' } });

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			const result = await estimateTransactionFees(mockRegisterValidatorTxRequestConnector);
			expect(result).toEqual(mockRegisterValidatorTxResult);
		});

		it('should throw if empty, undefined or null object is passed', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxSenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector.mockResolvedValue(mockTxRequestConnector);
			getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			await expect(estimateTransactionFees({})).rejects.toBeTruthy();
			await expect(estimateTransactionFees(undefined)).rejects.toBeTruthy();
			await expect(estimateTransactionFees(null)).rejects.toBeTruthy();
		});

		it('should throw when getAuthAccountInfo fails', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxSenderAddress);
			requestConnector.mockRejectedValue('Error');
			getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);
			await expect(estimateTransactionFees(mockTxRequest)).rejects.toBeTruthy();
		});

		it('should throw when requestConnector fails', async () => {
			requestConnector.mockRejectedValue('Error');

			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxSenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);
			await expect(estimateTransactionFees(mockTxRequest)).rejects.toBeTruthy();
		});

		it('should throw when getFeeEstimates fails', async () => {
			getFeeEstimates.mockReturnValue(new Error('Error'));

			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxSenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector.mockResolvedValue(mockTxRequestConnector);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);
			await expect(estimateTransactionFees(mockTxRequest)).rejects.toBeTruthy();
		});

		it('should throw Validation Exception when TOKEN_ID specified are incorrect', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxSenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector
				.mockReturnValueOnce(mockTxRequestConnector)
				.mockReturnValue({ userAccount: '1', escrowAccount: '0', minFee: '130000', size: 160 });
			getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

			mockTxRequest.transaction.params.tokenID = 'invalidTokenID';

			// Call the function
			await expect(estimateTransactionFees(mockTxRequest)).rejects.toBeTruthy();
		});

		it('should throw Validation Exception when address specified are incorrect', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxSenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector
				.mockReturnValueOnce(mockTxRequestConnector)
				.mockReturnValue({ userAccount: '1', escrowAccount: '0', minFee: '130000', size: 160 });
			getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

			mockTxRequest.transaction.params.recipientAddress = 'invalidAddress';

			// Call the function
			await expect(estimateTransactionFees(mockTxRequest)).rejects.toBeTruthy();
		});

		describe('Test estimateTransactionFees method for interoperability transactions', () => {
			const transactionsMap = {
				'interoperability:submitMainchainCrossChainUpdate': {
					request: mockInteroperabilitySubmitMainchainCrossChainUpdateTxRequest,
					result: mockInteroperabilitySubmitMainchainCrossChainUpdateTxResult,
				},
				'interoperability:registerSidechain': {
					request: mockInteroperabilityRegisterSidechainTxRequest,
					result: mockInteroperabilityRegisterSidechainTxResult,
				},
			};

			Object.entries(transactionsMap).forEach(([transactionType, transactionInfo]) => {
				it(`should calculate transaction fees correctly for ${transactionType} transaction`, async () => {
					// Mock the return values of the functions
					getLisk32AddressFromPublicKey.mockReturnValue(mockTxSenderAddress);
					getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
					requestConnector.mockReturnValueOnce(mockTxRequestConnector).mockReturnValue({
						userAccount: '1',
						escrowAccount: '0',
						fee: '100000000',
						minFee: '166000',
						size: 166,
					});
					getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
					calcAdditionalFees.mockResolvedValue({});
					calcMessageFee.mockResolvedValue({});
					getPosConstants.mockResolvedValue(posConstants);

					const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

					// Call the function
					const result = await estimateTransactionFees(transactionInfo.request);
					expect(result).toEqual(transactionInfo.result);
				});
			});
		});
	});

	describe('Test filterOptionalProps method', () => {
		const optionalProps = ['id', 'fee', 'signatures'];

		it('should return object with required properties', async () => {
			const { filterOptionalProps } = require(mockedTransactionFeeEstimatesFilePath);

			const input = {
				module: 'token',
				command: 'transferCrossChain',
				fee: '217000',
				nonce: '7',
				senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
				id: '0448028b3b0717776d4db10fc64dacf8096298377b31f740d73c9e9859ea4a26',
				signatures: [
					'7185e6e035c7804c5cbb166cb85581bc9beafd0fe2ecac9b83cb514c32ddc64ac546f16a1fba372f74493261658d1c8deac234e37b8ca23c4fd396e44e33fd0d',
				],
			};

			const expectedResponse = {
				module: 'token',
				command: 'transferCrossChain',
				nonce: '7',
				senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
			};

			const txWithRequiredProps = filterOptionalProps(input, optionalProps);
			expect(txWithRequiredProps).toMatchObject(expectedResponse);
		});

		it('should return an object when input is undefined', async () => {
			const { filterOptionalProps } = require(mockedTransactionFeeEstimatesFilePath);

			const txWithRequiredProps = filterOptionalProps(undefined, optionalProps);
			expect(Object.getOwnPropertyNames(txWithRequiredProps).length).toBe(0);
		});

		it('should return an object when input is null', async () => {
			const { filterOptionalProps } = require(mockedTransactionFeeEstimatesFilePath);

			const txWithRequiredProps = filterOptionalProps(null, optionalProps);
			expect(Object.getOwnPropertyNames(txWithRequiredProps).length).toBe(0);
		});
	});

	describe('Test getNumberOfSignatures method', () => {
		jest.mock(mockedRequestFilePath, () => ({
			requestConnector: jest.fn(),
		}));

		it('should return number of signatures as 1 for non-multiSig account', async () => {
			// Mock the return values of the functions
			requestConnector.mockReturnValueOnce(mockAuthAccountInfo);

			const { getNumberOfSignatures } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			const result = await getNumberOfSignatures(mockTxSenderAddress);
			expect(result).toEqual(1);
		});

		it('should return number of signatures as 2 for multiSig account', async () => {
			// Mock the return values of the functions
			requestConnector.mockReturnValueOnce(mockAuthInfoForMultisigAccount);

			const { getNumberOfSignatures } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			const result = await getNumberOfSignatures(mockTxSenderAddress);
			expect(result).toEqual(2);
		});
	});
});
