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
const mockedRTransactionsDryRunFilePath = resolve(`${__dirname}../../../../../../shared/dataService/business/transactionsDryRun`);

const {
	mockTxRequest,
	mockTxResult,
	mockTxsenderAddress,
	mockTxAuthAccountInfo,
	mockTxrequestConnector,
	posConstants,
	mockTxFeeEstimate,
	mockTransferCrossChainTxRequest,
	mockTransferCrossChainTxrequestConnector,
	mockTransferCrossChainTxResult,
	mockEscrowAccountExistsRequestConnector,
	mockInteroperabilitySubmitMainchainCrossChainUpdateTxRequest,
	mockInteroperabilitySubmitMainchainCrossChainUpdateTxResult,
	mockInteroperabilityRegisterSidechainTxRequest,
	mockInteroperabilityRegisterSidechainTxResult,
	mockAuthAccountInfo,
	mockAuthInfoForMultisigAccount,
	mockRegisterValidatorTxrequestConnector,
	mockRegisterValidatorTxResult,
} = require('../../constants/transactionEstimateFees');

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
			get: jest.fn((url) => {
				if (url.includes('/api/v3/blockchain/apps/meta')) {
					return Promise.resolve({
						data: {
							data: [{
								serviceURLs: [
									{
										http: 'http://mock-service.com',
										ws: 'ws://mock-service.com',
									},
								],
							}],
						},

					});
				} if (url.includes('/token/account/exists')) {
					return Promise.resolve({
						data: {
							data: { isExists: false },
						},

					});
				} if (url.includes('api/v3/token/constants')) {
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

describe('Test transaction fees estimates', () => {
	jest.mock(mockedMainchainFilePath, () => {
		const actual = jest.requireActual(mockedMainchainFilePath);
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

			const transaction = await mockTransaction(
				inputTransaction,
				authAccountInfo.numberOfSignatures,
			);
			expect(transaction).toMatchObject(inputTransaction);
		});

		it('should return multisignature transaction when called with all valid params', async () => {
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

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
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

			const { id, ...remParams } = inputTransaction;
			const transaction = await mockTransaction(remParams, authAccountInfo.numberOfSignatures);

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
			const transaction = await mockTransaction(remParams, authAccountInfo.numberOfSignatures);

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
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

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
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

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
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

			expect(async () => mockTransaction(undefined)).rejects.toThrow();
		});

		it('should throw error when transaction is null', async () => {
			const {
				mockTransaction,
			} = require(mockedTransactionFeeEstimatesFilePath);

			expect(async () => mockTransaction(null)).rejects.toThrow();
		});
	});

	describe('Test estimateTransactionFees method', () => {
		afterEach(() => jest.clearAllMocks());
		jest.resetModules();

		// Mock the dependencies
		const { calcAdditionalFees } = require(mockedTransactionFeeEstimatesFilePath);
		const { calcMessageFee } = require(mockedTransactionFeeEstimatesFilePath);
		const { getAuthAccountInfo } = require(mockedAuthFilePath);
		const { getLisk32AddressFromPublicKey } = require(mockedAccountFilePath);
		const { requestConnector } = require(mockedRequestFilePath);
		const { getPosConstants } = require(mockedPOSConstantsFilePath);
		const { getFeeEstimates } = require(mockedFeeEstimateFilePath);
		const { dryRunTransactions } = require(mockedRTransactionsDryRunFilePath);

		jest.mock(mockedRTransactionsDryRunFilePath, () => ({
			dryRunTransactions: jest.fn(),
		}));

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
			requestConnector
				.mockReturnValueOnce(mockTxrequestConnector)
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
			dryRunTransactions.mockReturnValue({ data: { events: [{ name: 'ccmSendSuccess', data: { ccm: 'hello' } }] } });
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector
				.mockReturnValueOnce(mockAuthAccountInfo)
				.mockReturnValueOnce(mockEscrowAccountExistsRequestConnector)
				.mockReturnValueOnce(mockTransferCrossChainTxrequestConnector)
				.mockReturnValueOnce('encoded CCM Object');
			getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			const result = await estimateTransactionFees(mockTransferCrossChainTxRequest);
			expect(result).toEqual(mockTransferCrossChainTxResult);
		});

		it('should calculate transaction fees correctly for register validator transaction', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector
				.mockReturnValueOnce(mockTxrequestConnector)
				.mockReturnValue({ validatorRegistrationFee: '1', minFee: '130000', size: 160 });
			getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			const result = await estimateTransactionFees(mockRegisterValidatorTxrequestConnector);
			expect(result).toEqual(mockRegisterValidatorTxResult);
		});

		it('should throw if empty, undefined or null object is passed', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector.mockResolvedValue(mockTxrequestConnector);
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
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
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
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
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
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector.mockResolvedValue(mockTxrequestConnector);
			calcAdditionalFees.mockResolvedValue({});
			calcMessageFee.mockResolvedValue({});
			getPosConstants.mockResolvedValue(posConstants);

			const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);
			await expect(estimateTransactionFees(mockTxRequest)).rejects.toBeTruthy();
		});

		it('should throw Validation Exception when TOKEN_ID specified are incorrect', async () => {
			// Mock the return values of the functions
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector
				.mockReturnValueOnce(mockTxrequestConnector)
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
			getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
			getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
			requestConnector
				.mockReturnValueOnce(mockTxrequestConnector)
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
					getLisk32AddressFromPublicKey.mockReturnValue(mockTxsenderAddress);
					getAuthAccountInfo.mockResolvedValue(mockTxAuthAccountInfo);
					requestConnector
						.mockReturnValueOnce(mockTxrequestConnector)
						.mockReturnValue({ userAccount: '1', escrowAccount: '0', fee: '100000000', minFee: '166000', size: 166 });
					getFeeEstimates.mockReturnValue(mockTxFeeEstimate);
					calcAdditionalFees.mockResolvedValue({});
					calcMessageFee.mockResolvedValue({});
					getPosConstants.mockResolvedValue(posConstants);

					const { estimateTransactionFees } = require(mockedTransactionFeeEstimatesFilePath);

					// Call the function
					const result = await estimateTransactionFees(
						transactionInfo.request,
					);
					expect(result).toEqual(
						transactionInfo.result,
					);
				});
			});
		});
	});

	describe('Test filterOptionalProps method', () => {
		const optionalProps = ['id', 'fee', 'signatures'];

		it('should return object with required properties', async () => {
			const {
				filterOptionalProps,
			} = require(mockedTransactionFeeEstimatesFilePath);

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
			const {
				filterOptionalProps,
			} = require(mockedTransactionFeeEstimatesFilePath);

			const txWithRequiredProps = filterOptionalProps(undefined, optionalProps);
			expect(Object.getOwnPropertyNames(txWithRequiredProps).length).toBe(0);
		});

		it('should return an object when input is null', async () => {
			const {
				filterOptionalProps,
			} = require(mockedTransactionFeeEstimatesFilePath);

			const txWithRequiredProps = filterOptionalProps(null, optionalProps);
			expect(Object.getOwnPropertyNames(txWithRequiredProps).length).toBe(0);
		});
	});

	describe('Test getNumberOfSignatures method', () => {
		// Mock the dependencies
		const { requestConnector } = require(mockedRequestFilePath);

		jest.mock(mockedRequestFilePath, () => ({
			requestConnector: jest.fn(),
		}));

		it('should return number of signatures as 1 for non-multiSig account', async () => {
			// Mock the return values of the functions
			requestConnector.mockReturnValueOnce(mockAuthAccountInfo);

			const { getNumberOfSignatures } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			const result = await getNumberOfSignatures(mockTxsenderAddress);
			expect(result).toEqual(1);
		});

		it('should return number of signatures as 2 for multiSig account', async () => {
			// Mock the return values of the functions
			requestConnector.mockReturnValueOnce(mockAuthInfoForMultisigAccount);

			const { getNumberOfSignatures } = require(mockedTransactionFeeEstimatesFilePath);

			// Call the function
			const result = await getNumberOfSignatures(mockTxsenderAddress);
			expect(result).toEqual(2);
		});
	});
});
