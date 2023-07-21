/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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

const {
	getAddressFromParams,
	getToday,
	normalizeTransaction,
	parseInputToCsv,
	transactionsToCSV,

	standardizeIntervalFromParams,
	getPartialFilenameFromParams,
	getCsvFilenameFromParams,
	getCsvFileUrlFromParams,
} = require('../../shared/csvExport');

const {
	interval,
	generateExcpectedCsv,
	tokenTransfer,
} = require('../constants/csvExport');

const config = require('../../config');
const fieldMappings = require('../../shared/csvFieldMappings');

describe('CSV export utils', () => {
	const standardizedIntervalRegex = /^\b((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31)):((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\b$/g;
	const partialFileNameRegex = /^\b(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.json\b$/g;
	const csvFileNameRegex = /^\btransactions_(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.csv\b$/g;
	const csvFileUrlRegex = /^^\/api\/v3\/export\/download\?filename=transactions_(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.csv$/g;
	const address = 'lskeqretdgm6855pqnnz69ahpojk5yxfsv2am34et';
	const publicKey = 'b7fdfc991c52ad6646159506a8326d4203c868bd3f16b8043c8e4e034346e581';
	const partialFilenameExtension = '.json';
	const csvFilenameExtension = '.csv';
	const csvFileUrlBeginsWith = '/api/v3/export/';

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
			const csv = await transactionsToCSV(transactionList);
			expect(csv).toContain(newline);
			const lines = csv.split(newline);
			// 1 header, #rows from transactionList
			expect(lines.length).toBe(transactionList.length + 1);

			const normalizedTx = await normalizeTransaction(
				tokenTransfer.toOther.sender,
				tokenTransfer.toOther.transaction,
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
			const csv = await transactionsToCSV(transactionList);
			expect(csv).toContain(newline);
			const lines = csv.split(newline);
			// 1 header, #rows from transactionList, 1 row from the duplicate
			expect(transactionList.length).toBeGreaterThan(initialTxCount);
			expect(lines.length).toBe(initialTxCount + 2);
		});
	});

	describe('Test standardizeIntervalFromParams method', () => {
		it(`should return interval in standard format: '${config.csv.dateFormat}:${config.csv.dateFormat}'`, async () => {
			const result = await standardizeIntervalFromParams({ interval: interval.startEnd });
			expect(typeof result).toBe('string');
			expect(result.length).toBe((2 * config.csv.dateFormat.length) + 1);
			expect(result).toMatch(standardizedIntervalRegex);
		});

		it('should return standardized interval when both start and end date supplied', async () => {
			const result = await standardizeIntervalFromParams({ interval: interval.startEnd });
			expect(typeof result).toBe('string');
			expect(result.length).toBe((2 * config.csv.dateFormat.length) + 1);
			expect(result).toMatch(standardizedIntervalRegex);
		});

		it('should return standardized interval when only start date supplied', async () => {
			const result = await standardizeIntervalFromParams({ interval: interval.onlyStart });
			expect(typeof result).toBe('string');
			expect(result.length).toBe((2 * config.csv.dateFormat.length) + 1);
			expect(result).toMatch(standardizedIntervalRegex);
		});

		xit('should return standardized interval when dates not supplied', async () => {
			const result = await standardizeIntervalFromParams({});
			expect(typeof result).toBe('string');
			expect(result.length).toBe((2 * config.csv.dateFormat.length) + 1);
			expect(result).toMatch(standardizedIntervalRegex);
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

	describe('Test getCsvFilenameFromParams method', () => {
		it('should return csv filename when called with address and complete interval with start and end date supplied', async () => {
			const params = { address, interval: interval.startEnd };
			const csvFilename = await getCsvFilenameFromParams(params);
			expect(csvFilename.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilename).toContain(address);
			expect(csvFilename).toMatch(csvFileNameRegex);
		});

		it('should return csv filename when called with publicKey and complete interval with start and end date supplied', async () => {
			const params = { publicKey, interval: interval.startEnd };
			const csvFilename = await getCsvFilenameFromParams(params);
			expect(csvFilename.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilename).toContain(address);
			expect(csvFilename).toMatch(csvFileNameRegex);
		});

		it('should return csv filename when called with address and interval with only start date supplied', async () => {
			const params = { address, interval: interval.onlyStart };
			const csvFilename = await getCsvFilenameFromParams(params);
			expect(csvFilename.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilename).toContain(address);
			expect(csvFilename).toMatch(csvFileNameRegex);
		});

		it('should return csv filename when called with publicKey and interval with only start date supplied', async () => {
			const params = { publicKey, interval: interval.onlyStart };
			const csvFilename = await getCsvFilenameFromParams(params);
			expect(csvFilename.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilename).toContain(address);
			expect(csvFilename).toMatch(csvFileNameRegex);
		});

		xit('should return csv filename when called with address and no interval supplied', async () => {
			const params = { address };
			const csvFilename = await getCsvFilenameFromParams(params);
			expect(csvFilename.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilename).toContain(address);
			expect(csvFilename).toMatch(csvFileNameRegex);
		});

		xit('should return csv filename when called with publicKey and no interval supplied', async () => {
			const params = { publicKey };
			const csvFilename = await getCsvFilenameFromParams(params);
			expect(csvFilename.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilename).toContain(address);
			expect(csvFilename).toMatch(csvFileNameRegex);
		});
	});

	describe('Test getCsvFileUrlFromParams method', () => {
		it('should return csv filpath URL when called with address and complete interval with start and end date supplied', async () => {
			const params = { address, interval: interval.startEnd };
			const csvFilepathUrl = await getCsvFileUrlFromParams(params);
			expect(csvFilepathUrl.startsWith(csvFileUrlBeginsWith)).toBeTruthy();
			expect(csvFilepathUrl.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilepathUrl).toContain(address);
			expect(csvFilepathUrl).toMatch(csvFileUrlRegex);
		});

		it('should return csv filpath URL when called with publicKey and complete interval with start and end date supplied', async () => {
			const params = { publicKey, interval: interval.startEnd };
			const csvFilepathUrl = await getCsvFileUrlFromParams(params);
			expect(csvFilepathUrl.startsWith(csvFileUrlBeginsWith)).toBeTruthy();
			expect(csvFilepathUrl.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilepathUrl).toContain(address);
			expect(csvFilepathUrl).toMatch(csvFileUrlRegex);
		});

		it('should return csv filpath URL when called with address and interval with only start date supplied', async () => {
			const params = { address, interval: interval.onlyStart };
			const csvFilepathUrl = await getCsvFileUrlFromParams(params);
			expect(csvFilepathUrl.startsWith(csvFileUrlBeginsWith)).toBeTruthy();
			expect(csvFilepathUrl.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilepathUrl).toContain(address);
			expect(csvFilepathUrl).toMatch(csvFileUrlRegex);
		});

		it('should return csv filpath URL when called with publicKey and interval with only start date supplied', async () => {
			const params = { publicKey, interval: interval.onlyStart };
			const csvFilepathUrl = await getCsvFileUrlFromParams(params);
			expect(csvFilepathUrl.startsWith(csvFileUrlBeginsWith)).toBeTruthy();
			expect(csvFilepathUrl.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilepathUrl).toContain(address);
			expect(csvFilepathUrl).toMatch(csvFileUrlRegex);
		});

		xit('should return csv filpath URL when called with address and no interval supplied', async () => {
			const params = { address };
			const csvFilepathUrl = await getCsvFileUrlFromParams(params);
			expect(csvFilepathUrl.startsWith(csvFileUrlBeginsWith)).toBeTruthy();
			expect(csvFilepathUrl.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilepathUrl).toContain(address);
			expect(csvFilepathUrl).toMatch(csvFileUrlRegex);
		});

		xit('should return csv filpath URL when called with publicKey and no interval supplied', async () => {
			const params = { publicKey };
			const csvFilepathUrl = await getCsvFileUrlFromParams(params);
			expect(csvFilepathUrl.startsWith(csvFileUrlBeginsWith)).toBeTruthy();
			expect(csvFilepathUrl.endsWith(csvFilenameExtension)).toBeTruthy();
			expect(csvFilepathUrl).toContain(address);
			expect(csvFilepathUrl).toMatch(csvFileUrlRegex);
		});
	});
});
