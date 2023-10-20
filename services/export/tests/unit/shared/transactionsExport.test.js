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
/* eslint-disable mocha/max-top-level-suites */

const { resolve } = require('path');
const moment = require('moment');

const { interval, tokenTransfer } = require('../../constants/csvExport');

const { transactions } = require('../../constants/transaction');

const { blocks } = require('../../constants/blocks');

const config = require('../../../config');
const fieldMappings = require('../../../shared/excelFieldMappings');
const { PARTIAL_FILENAME } = require('../../../shared/regex');

const {
	getAddressFromParams,
	getToday,
	normalizeTransaction,
	getPartialFilenameFromParams,
	resolveChainIDs,
	normalizeBlocks,
} = require('../../../shared/transactionsExport');

const { dateFromTimestamp, timeFromTimestamp } = require('../../../shared/helpers/time');

const mockedRequestFilePath = resolve(`${__dirname}/../../../shared/helpers/request`);
const mockedRequestAllFilePath = resolve(`${__dirname}/../../../shared/requestAll`);

jest.mock('lisk-service-framework', () => {
	const actualLiskServiceFramework = jest.requireActual('lisk-service-framework');
	return {
		...actualLiskServiceFramework,
		DB: {
			...actualLiskServiceFramework.DB,
			MySQL: {
				...actualLiskServiceFramework.DB.MySQL,
				KVStore: {
					...actualLiskServiceFramework.DB.MySQL.KVStore,
					getKeyValueTable: jest.fn(),
				},
			},
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
		Queue: jest.fn(),
	};
});

beforeEach(() => jest.resetModules());

const address = 'lskpg7qukha2nmu9483huwk8oty7q3pyevh3bohr4';
const publicKey = '86cbecb2a176934e454f63e7ffa05783be6960d90002c5558dfd31397cd8f020';
const chainID = '04000000';
const txFeeTokenID = '0400000000000000';
const partialFilenameExtension = '.json';

describe('Test getOpeningBalance method', () => {
	it('should return opening balance when called with valid address', async () => {
		const mockUserSubstore = [
			{
				address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
				availableBalance: '100000000000000',
				lockedBalances: [],
				tokenID: '0400000000000000',
			},
		];

		jest.mock(mockedRequestAllFilePath, () => {
			const actual = jest.requireActual(mockedRequestAllFilePath);
			return {
				...actual,
				requestAllCustom() {
					return { userSubstore: mockUserSubstore };
				},
			};
		});

		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestConnector() {
					return { token: { userSubstore: mockUserSubstore } };
				},
			};
		});

		const { getOpeningBalance } = require('../../../shared/transactionsExport');

		const openingBalance = await getOpeningBalance('lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo');
		const expectedResponse = {
			tokenID: '0400000000000000',
			amount: '100000000000000',
		};

		expect(openingBalance).toEqual(expectedResponse);
	});

	it('should throw error when called with undefined', async () => {
		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestConnector() {
					return undefined;
				},
			};
		});

		const { getOpeningBalance } = require('../../../shared/transactionsExport');
		expect(getOpeningBalance(undefined)).rejects.toThrow();
	});
});

describe('Test getCrossChainTransferTransactionInfo method', () => {
	it('should return transaction info when called with valid address', async () => {
		const mockEventData = [
			{
				id: 'efe94d3a5ad35297098614100c5dd7bff6657d38baed08fb850fa9ce69b0862c',
				module: 'token',
				name: 'ccmTransfer',
				data: {
					senderAddress: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
					recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
					tokenID: '0400000000000000',
					amount: '100000000000',
					receivingChainID: '04000001',
					result: 0,
				},
				topics: [
					'efcbab90c4769dc47029412010ef76623722678f446a7417f59fed998a6407de',
					'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
					'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
				],
				block: {
					id: '1fc7e1a4a06a6b9610ed5e4fb48c9f839b1fcd0f91b3f6d4c22f9f64eac40657',
					height: 313,
					timestamp: 1689693410,
				},
			},
		];

		jest.mock(mockedRequestAllFilePath, () => {
			const actual = jest.requireActual(mockedRequestAllFilePath);
			return {
				...actual,
				requestAllStandard() {
					return mockEventData;
				},
			};
		});

		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestIndexer() {
					return {
						data: [
							{
								moduleCommand: 'interoperability:submitSidechainCrossChainUpdate',
								params: { sendingChainID: '04000000' },
							},
						],
					};
				},
			};
		});

		const { getCrossChainTransferTransactionInfo } = require('../../../shared/transactionsExport');

		const crossChainTransferTxs = await getCrossChainTransferTransactionInfo({
			address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
		});
		const expectedResponse = [
			{
				block: {
					id: '1fc7e1a4a06a6b9610ed5e4fb48c9f839b1fcd0f91b3f6d4c22f9f64eac40657',
					height: 313,
					timestamp: 1689693410,
				},
				id: 'efcbab90c4769dc47029412010ef76623722678f446a7417f59fed998a6407de',
				isIncomingCrossChainTransferTransaction: true,
				moduleCommand: 'interoperability:submitSidechainCrossChainUpdate',
				params: {
					amount: '100000000000',
					data: "This entry was generated from 'ccmTransfer' event emitted from the specified CCU transactionID.",
					receivingChainID: '04000001',
					recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
					result: 0,
					senderAddress: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
					tokenID: '0400000000000000',
				},
				sender: {
					address: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
				},
				sendingChainID: '04000000',
			},
		];

		expect(crossChainTransferTxs).toEqual(expectedResponse);
	});

	it('should throw error when called with undefined', async () => {
		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestIndexer() {
					return undefined;
				},
			};
		});

		const { getCrossChainTransferTransactionInfo } = require('../../../shared/transactionsExport');
		expect(getCrossChainTransferTransactionInfo(undefined)).rejects.toThrow();
	});
});

describe('Test getRewardAssignedInfo method', () => {
	it('should return reward assigned info when called with valid address', async () => {
		const mockEventData = [
			{
				id: 'efe94d3a5ad35297098614100c5dd7bff6657d38baed08fb850fa9ce69b0862c',
				module: 'pos',
				name: 'rewardsAssigned',
				data: {
					stakerAddress: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
					validatorAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
					tokenID: '0400000000000000',
					amount: '100000000000',
					result: 0,
				},
				topics: [
					'efcbab90c4769dc47029412010ef76623722678f446a7417f59fed998a6407de',
					'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
				],
				block: {
					id: '1fc7e1a4a06a6b9610ed5e4fb48c9f839b1fcd0f91b3f6d4c22f9f64eac40657',
					height: 313,
					timestamp: 1689693410,
				},
			},
		];

		jest.mock(mockedRequestAllFilePath, () => {
			const actual = jest.requireActual(mockedRequestAllFilePath);
			return {
				...actual,
				requestAllStandard() {
					return mockEventData;
				},
			};
		});

		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestIndexer() {
					return {
						data: [
							{
								moduleCommand: 'pos:stake',
								params: {
									stakes: [
										{
											validatorAddress: 'lskkdvzyxhvm2kmgs8hmteaad2zrjbjmf4cft9zpp',
											amount: '-1000000000',
										},
										{
											validatorAddress: 'lsk64zamp63e9km9p6vtfea9c5pda2wuw79tc8a9k',
											amount: '2000000000',
										},
									],
								},
							},
						],
					};
				},
			};
		});

		const { getRewardAssignedInfo } = require('../../../shared/transactionsExport');

		const rewardsAssignedInfo = await getRewardAssignedInfo({
			address: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
		});
		const expectedResponse = [
			{
				block: {
					id: '1fc7e1a4a06a6b9610ed5e4fb48c9f839b1fcd0f91b3f6d4c22f9f64eac40657',
					height: 313,
					timestamp: 1689693410,
				},
				id: 'efcbab90c4769dc47029412010ef76623722678f446a7417f59fed998a6407de',
				moduleCommand: 'pos:stake',
				params: {
					amount: '100000000000',
					data: "This entry was generated from 'rewardsAssigned' event emitted from the specified transactionID.",
					validatorAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
					result: 0,
					stakerAddress: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
					tokenID: '0400000000000000',
				},
				sender: {
					address: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
				},
				rewardAmount: '100000000000',
				rewardTokenID: '0400000000000000',
			},
		];

		expect(rewardsAssignedInfo).toEqual(expectedResponse);
	});

	it('should throw error when called with undefined', async () => {
		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestIndexer() {
					return undefined;
				},
			};
		});

		const { getRewardAssignedInfo } = require('../../../shared/transactionsExport');
		expect(getRewardAssignedInfo(undefined)).rejects.toThrow();
	});
});

describe('Test getAddressFromParams method', () => {
	it('should return address from address in params', async () => {
		const result = getAddressFromParams({ address });
		expect(result).toBe(address);
	});

	it('should return address from publicKey in params', async () => {
		const result = getAddressFromParams({ publicKey });
		expect(result).toBe(address);
	});
});

describe('Test getToday method', () => {
	it(`should return current date in '${config.excel.dateFormat}' format`, async () => {
		const today = getToday();
		expect(today).toBe(moment().format(config.excel.dateFormat));
	});
});

describe('Test normalizeTransaction method', () => {
	it('should return a transaction normalized', async () => {
		const normalizedTx = await normalizeTransaction(
			tokenTransfer.toOther.sender,
			tokenTransfer.toOther.transaction,
			chainID,
			txFeeTokenID,
		);
		const expectedFields = Object.values(fieldMappings.transactionMappings).map(v =>
			v.key !== 'blockReward' ? v.key : undefined,
		);
		expect(Object.keys(normalizedTx)).toEqual(
			expect.arrayContaining(expectedFields.filter(e => e)),
		);
	});
});

describe('Test getPartialFilenameFromParams method', () => {
	it('should return partial filename when called with address', async () => {
		const params = { address, interval: interval.startEnd };
		const partialFilename = await getPartialFilenameFromParams(params, interval.onlyStart);
		expect(partialFilename.endsWith(partialFilenameExtension)).toBeTruthy();
		expect(partialFilename).toContain(address);
		expect(partialFilename).toMatch(PARTIAL_FILENAME);
	});

	it('should return partial filename when called with publicKey', async () => {
		const params = { publicKey, interval: interval.onlyStart };
		const partialFilename = await getPartialFilenameFromParams(params, interval.onlyStart);
		expect(partialFilename.endsWith(partialFilenameExtension)).toBeTruthy();
		expect(partialFilename).toContain(address);
		expect(partialFilename).toMatch(PARTIAL_FILENAME);
	});
});

describe('Test resolveChainIDs method', () => {
	it('should return same sendingChainID and receivingChainID when called with token transfer transaction', async () => {
		const response = resolveChainIDs(transactions.tokenTransfer, chainID);
		const expectedResponse = {
			receivingChainID: '04000000',
			sendingChainID: '04000000',
		};
		expect(response).toEqual(expectedResponse);
	});

	it('should return sendingChainID and receivingChainID when called with token transferCrossChain transaction', async () => {
		const response = resolveChainIDs(transactions.tokenTransferCrossChain, chainID);
		const expectedResponse = {
			receivingChainID: '04000001',
			sendingChainID: '04000000',
		};
		expect(response).toEqual(expectedResponse);
	});

	it('should return empty object when called with non-token transferCrossChain transaction', async () => {
		const response = resolveChainIDs(transactions.stake, chainID);
		expect(Object.getOwnPropertyNames(response).length).toBe(0);
	});
});

describe('Test normalizeBlocks method', () => {
	it('should return a blocks normalized when called with valid blocks', async () => {
		const normalizedBlocks = await normalizeBlocks(blocks);
		const expectedResponse = [
			{
				blockHeight: blocks[0].height,
				blockReward: blocks[0].reward,
				date: dateFromTimestamp(blocks[0].timestamp),
				time: timeFromTimestamp(blocks[0].timestamp),
			},
			{
				blockHeight: blocks[1].height,
				blockReward: blocks[1].reward,
				date: dateFromTimestamp(blocks[1].timestamp),
				time: timeFromTimestamp(blocks[1].timestamp),
			},
		];
		expect(normalizedBlocks).toEqual(expectedResponse);
	});

	it('should throw error when called with null', async () => {
		expect(normalizeBlocks(null)).rejects.toThrow();
	});

	it('should throw error when called with undefined', async () => {
		expect(normalizeBlocks(undefined)).rejects.toThrow();
	});
});
