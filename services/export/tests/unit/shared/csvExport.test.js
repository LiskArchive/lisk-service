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
const moment = require('moment');
const { resolve } = require('path');

const {
	interval,
	generateExcpectedCsv,
	tokenTransfer,
} = require('../../constants/csvExport');

const config = require('../../../config');
const fieldMappings = require('../../../shared/csvFieldMappings');

const mockedRequestFilePath = resolve(`${__dirname}/../../../shared/helpers/request`);

jest.mock('lisk-service-framework', () => {
	const actualLiskServiceFramework = jest.requireActual('lisk-service-framework');
	return {
		...actualLiskServiceFramework,
		MySQL: {
			...actualLiskServiceFramework.MySQL,
			KVStore: {
				...actualLiskServiceFramework.KVStore,
				getKeyValueTable: jest.fn(),
			},
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
		Queue: jest.fn(),
	};
});

beforeEach(() => jest.resetModules());

const partialFileNameRegex = /^\b(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.json\b$/g;
const address = 'lskeqretdgm6855pqnnz69ahpojk5yxfsv2am34et';
const publicKey = 'b7fdfc991c52ad6646159506a8326d4203c868bd3f16b8043c8e4e034346e581';
const chainID = '04000000';
const partialFilenameExtension = '.json';

describe('Test getConversionFactor method', () => {
	const validChainID = '04000000';
	const invalidChainID = 'invalid';

	it('should return conversion factor when called with valid chainID', async () => {
		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestAppRegistry() {
					return {
						data: [{
							displayDenom: 'lsk',
							baseDenom: 'beddows',
							denomUnits: [
								{
									denom: 'beddows',
									decimals: 0,
									aliases: [
										'Beddows',
									],
								},
								{
									denom: 'lsk',
									decimals: 8,
									aliases: [
										'Lisk',
									],
								},
							],
						}],
					};
				},
			};
		});

		const { getConversionFactor } = require('../../../shared/csvExport');

		const conversionFactor = await getConversionFactor(validChainID);
		expect(conversionFactor).toEqual(8);
	});

	it('should throw error when called with invalid chainID', async () => {
		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestAppRegistry() {
					return undefined;
				},
			};
		});

		const { getConversionFactor } = require('../../../shared/csvExport');
		expect(getConversionFactor(invalidChainID)).rejects.toThrow();
	});
});

describe('Test getOpeningBalance method', () => {
	it('should return opening balance when called with valid address', async () => {
		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestConnector() {
					return {
						userSubstore: [{
							address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
							availableBalance: '100000000000000',
							lockedBalances: [],
							tokenID: '0400000000000000',
						}],
					};
				},
			};
		});

		const { getOpeningBalance } = require('../../../shared/csvExport');

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

		const { getOpeningBalance } = require('../../../shared/csvExport');
		expect(getOpeningBalance(undefined)).rejects.toThrow();
	});
});

describe('Test getCrossChainTransferTransactionInfo method', () => {
	it('should return opening balance when called with valid address', async () => {
		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestIndexer() {
					return {
						data: [{
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
						}],
					};
				},
			};
		});

		const { getCrossChainTransferTransactionInfo } = require('../../../shared/csvExport');

		const crossChainTransferTxs = await getCrossChainTransferTransactionInfo({ address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo' });
		const expectedResponse = [{
			block: {
				id: '1fc7e1a4a06a6b9610ed5e4fb48c9f839b1fcd0f91b3f6d4c22f9f64eac40657',
				height: 313,
				timestamp: 1689693410,
			},
			id: 'efcbab90c4769dc47029412010ef76623722678f446a7417f59fed998a6407de',
			moduleCommand: 'token:transferCrossChain',
			params: {
				amount: '100000000000',
				receivingChainID: '04000001',
				recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
				result: 0,
				senderAddress: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
				tokenID: '0400000000000000',
			},
			sender: {
				address: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
			},
		}];

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

		const { getCrossChainTransferTransactionInfo } = require('../../../shared/csvExport');
		expect(getCrossChainTransferTransactionInfo(undefined)).rejects.toThrow();
	});
});

const {
	getAddressFromParams,
	getToday,
	normalizeTransaction,
	parseInputToCsv,
	transactionsToCSV,
	getPartialFilenameFromParams,
} = require('../../../shared/csvExport');

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
	it(`should return current date in '${config.csv.dateFormat}' format`, async () => {
		const today = getToday();
		expect(today).toBe(moment().format(config.csv.dateFormat));
	});
});

describe('Test normalizeTransaction method', () => {
	it('should return a transaction normalized to be converted to CSV', async () => {
		const normalizedTx = await normalizeTransaction(
			tokenTransfer.toOther.sender,
			tokenTransfer.toOther.transaction,
			chainID,
		);
		const expectedFields = Object.values(fieldMappings.transactionMappings).map((v) => v.value);
		expect(Object.keys(normalizedTx)).toEqual(expect.arrayContaining(expectedFields));
	});
});

describe('Test parseInputToCsv method', () => {
	it('should return transactions as CSV', async () => {
		const csv = parseInputToCsv(
			tokenTransfer.toOther.transaction,
			fieldMappings.transactionMappings);

		const expectedTx = {};
		Object.values(fieldMappings.transactionMappings).forEach((v) => {
			expectedTx[`${v.label}`] = tokenTransfer.toOther.transaction[v.value] || null;
		});
		expect(csv).toBe(generateExcpectedCsv(expectedTx, config.csv.delimiter));
	});
});

describe('Test transactionsToCSV method', () => {
	const newline = '\n';

	it('should return transactions as CSV', async () => {
		const transactionList = [tokenTransfer.toOther.transaction];
		const csv = await transactionsToCSV(transactionList, address, chainID);
		expect(csv).toContain(newline);
		const lines = csv.split(newline);
		// 1 header, #rows from transactionList
		expect(lines.length).toBe(transactionList.length + 1);

		const normalizedTx = await normalizeTransaction(
			tokenTransfer.toOther.sender,
			tokenTransfer.toOther.transaction,
			chainID,
		);
		const replacedKeysTx = {};
		Object.entries(normalizedTx).forEach(([k, v]) => {
			const [entry] = fieldMappings.transactionMappings.filter(e => e.value === k);
			replacedKeysTx[`${entry.label}`] = v;
		});
		expect(csv).toBe(generateExcpectedCsv(replacedKeysTx, config.csv.delimiter));
	});

	it('should adds duplicate entry for self-token-transfer transactions and returns as CSV', async () => {
		const transactionList = [tokenTransfer.toSelf.transaction];
		const initialTxCount = transactionList.length;
		const csv = await transactionsToCSV(transactionList, address, chainID);
		expect(csv).toContain(newline);
		const lines = csv.split(newline);
		// 1 header, #rows from transactionList, 1 row from the duplicate
		expect(transactionList.length).toBeGreaterThan(initialTxCount);
		expect(lines.length).toBe(initialTxCount + 2);
	});
});

describe('Test getPartialFilenameFromParams method', () => {
	it('should return partial filename when called with address', async () => {
		const params = { address, interval: interval.startEnd };
		const partialFilename = await getPartialFilenameFromParams(params, interval.onlyStart);
		expect(partialFilename.endsWith(partialFilenameExtension)).toBeTruthy();
		expect(partialFilename).toContain(address);
		expect(partialFilename).toMatch(partialFileNameRegex);
	});

	it('should return partial filename when called with publicKey', async () => {
		const params = { publicKey, interval: interval.onlyStart };
		const partialFilename = await getPartialFilenameFromParams(params, interval.onlyStart);
		expect(partialFilename.endsWith(partialFilenameExtension)).toBeTruthy();
		expect(partialFilename).toContain(address);
		expect(partialFilename).toMatch(partialFileNameRegex);
	});
});

