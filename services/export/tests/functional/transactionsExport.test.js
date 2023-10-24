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
const {
	standardizeIntervalFromParams,
	getExcelFilenameFromParams,
	getExcelFileUrlFromParams,
} = require('../../shared/transactionsExport');

const { interval } = require('../constants/csvExport');

const {
	STANDARDIZED_INTERVAL,
	EXCEL_EXPORT_FILENAME,
	EXCEL_FILE_URL,
} = require('../../shared/regex');

const config = require('../../config');

describe('Excel export utils', () => {
	const address = 'lskeqretdgm6855pqnnz69ahpojk5yxfsv2am34et';
	const publicKey = 'b7fdfc991c52ad6646159506a8326d4203c868bd3f16b8043c8e4e034346e581';
	const excelFilenameExtension = '.xlsx';
	const excelFileUrlBeginsWith = '/api/v3/export/';

	describe('Test standardizeIntervalFromParams method', () => {
		it('should return standardized interval when both start and end date supplied', async () => {
			const result = await standardizeIntervalFromParams({ interval: interval.startEnd });
			expect(typeof result).toBe('string');
			expect(result.length).toBe(2 * config.excel.dateFormat.length + 1);
			expect(result).toMatch(STANDARDIZED_INTERVAL);
		});

		it('should return standardized interval when only start date supplied', async () => {
			const result = await standardizeIntervalFromParams({ interval: interval.onlyStart });
			expect(typeof result).toBe('string');
			expect(result.length).toBe(2 * config.excel.dateFormat.length + 1);
			expect(result).toMatch(STANDARDIZED_INTERVAL);
		});

		xit('should return standardized interval when dates not supplied', async () => {
			const result = await standardizeIntervalFromParams({});
			expect(typeof result).toBe('string');
			expect(result.length).toBe(2 * config.excel.dateFormat.length + 1);
			expect(result).toMatch(STANDARDIZED_INTERVAL);
		});
	});

	describe('Test getExcelFilenameFromParams method', () => {
		it('should return excel filename when called with address and complete interval with start and end date supplied', async () => {
			const params = { address, interval: interval.startEnd };
			const excelFilename = await getExcelFilenameFromParams(params);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});

		it('should return excel filename when called with publicKey and complete interval with start and end date supplied', async () => {
			const params = { publicKey, interval: interval.startEnd };
			const excelFilename = await getExcelFilenameFromParams(params);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});

		it('should return excel filename when called with address and interval with only start date supplied', async () => {
			const params = { address, interval: interval.onlyStart };
			const excelFilename = await getExcelFilenameFromParams(params);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});

		it('should return excel filename when called with publicKey and interval with only start date supplied', async () => {
			const params = { publicKey, interval: interval.onlyStart };
			const excelFilename = await getExcelFilenameFromParams(params);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});

		xit('should return excel filename when called with address and no interval supplied', async () => {
			const params = { address };
			const excelFilename = await getExcelFilenameFromParams(params);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});

		xit('should return excel filename when called with publicKey and no interval supplied', async () => {
			const params = { publicKey };
			const excelFilename = await getExcelFilenameFromParams(params);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});
	});

	describe('Test getExcelFileUrlFromParams method', () => {
		it('should return excel filpath URL when called with address and complete interval with start and end date supplied', async () => {
			const params = { address, interval: interval.startEnd };
			const excelFilepathUrl = await getExcelFileUrlFromParams(params);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});

		it('should return excel filpath URL when called with publicKey and complete interval with start and end date supplied', async () => {
			const params = { publicKey, interval: interval.startEnd };
			const excelFilepathUrl = await getExcelFileUrlFromParams(params);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});

		it('should return excel filpath URL when called with address and interval with only start date supplied', async () => {
			const params = { address, interval: interval.onlyStart };
			const excelFilepathUrl = await getExcelFileUrlFromParams(params);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});

		it('should return excel filpath URL when called with publicKey and interval with only start date supplied', async () => {
			const params = { publicKey, interval: interval.onlyStart };
			const excelFilepathUrl = await getExcelFileUrlFromParams(params);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});

		xit('should return excel filpath URL when called with address and no interval supplied', async () => {
			const params = { address };
			const excelFilepathUrl = await getExcelFileUrlFromParams(params);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});

		xit('should return excel filpath URL when called with publicKey and no interval supplied', async () => {
			const params = { publicKey };
			const excelFilepathUrl = await getExcelFileUrlFromParams(params);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});
	});
});
