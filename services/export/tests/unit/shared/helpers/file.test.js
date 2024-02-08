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
const path = require('path');
const fs = require('fs');

const { interval } = require('../../../constants/csvExport');
const { dynamicFieldsCustomDelimiter } = require('../../../constants/csv');
const {
	PARTIAL_FILENAME,
	EXCEL_EXPORT_FILENAME,
	EXCEL_FILE_URL,
} = require('../../../../shared/regex');

const mockedChainFilePath = path.resolve(`${__dirname}/../../../../shared/helpers/chain`);

beforeEach(() => jest.resetModules());

describe('Test filesystem interface', () => {
	let dirPath;
	const testData = dynamicFieldsCustomDelimiter.expectedCsv;

	beforeAll(async () => {
		// Test directory
		dirPath = `${path.dirname(__dirname)}/testDir`;
	});

	afterAll(async () => {
		// Remove test directory
		await fs.rmdirSync(dirPath);
	});

	it('should create a directory when calling init() method', async () => {
		const { init, fileExists } = require('../../../../shared/helpers/file');

		await init({ dirPath });
		const isExists = await fileExists(dirPath);
		expect(isExists).toBe(true);
	});

	it('should write data to a file when calling write() method', async () => {
		const { write } = require('../../../../shared/helpers/file');
		const filePath = `${dirPath}/testfile.csv`;

		// Write data into the file
		await write(filePath, testData);

		// Verify if data is written into the file
		expect(fs.statSync(filePath).size).toBeGreaterThan(0);
	});

	it('should return the data from a file when calling read() method', async () => {
		const filePath = `${dirPath}/testfile.csv`;

		const { read } = require('../../../../shared/helpers/file');

		// Read data from file
		const result = await read(filePath);
		expect(result).toEqual(testData);
	});

	it('should remove a file when calling remove() method', async () => {
		const filePath = `${dirPath}/testfile.csv`;
		const { remove, fileExists } = require('../../../../shared/helpers/file');
		let isExists = await fileExists(filePath);
		expect(isExists).toBe(true);

		await remove(filePath, { force: true });
		isExists = await fileExists(filePath);
		expect(isExists).toBe(false);
	});

	it('should return the list of files in a directory when calling list() method', async () => {
		const filePath1 = `${dirPath}/testfile1.csv`;
		const filePath2 = `${dirPath}/testfile2.csv`;

		const { write, list } = require('../../../../shared/helpers/file');

		await write(filePath1, testData);
		await write(filePath2, testData);

		const files = await list(dirPath);
		expect(files.length).toBe(2);
	});

	it('should return false for a directory when calling isFile() method', async () => {
		const { write, isFile } = require('../../../../shared/helpers/file');
		expect(await isFile(dirPath)).toBe(false);

		const filePath = `${dirPath}/testfile.csv`;
		await write(filePath, testData);
		expect(await isFile(filePath)).toBe(true);
	});

	it('should throw error when calling purge() method when path is null', async () => {
		const { list, purge } = require('../../../../shared/helpers/file');
		const files = await list(dirPath);
		expect(files.length).toBe(3);

		await expect(purge(null, 0)).rejects.toThrow();
	});

	it('should remove all files in a directory when calling purge() method', async () => {
		const { list, purge } = require('../../../../shared/helpers/file');
		let files = await list(dirPath);
		expect(files.length).toBe(3);

		await purge(dirPath, 0);

		files = await list(dirPath);
		expect(files.length).toBe(0);
	});

	it('should return true for file path within the directory', () => {
		const { isFilePathInDirectory } = require('../../../../shared/helpers/file');
		const filePath = `${dirPath}/testfile.csv`;
		const result = isFilePathInDirectory(filePath, dirPath);
		expect(result).toBe(true);
	});

	it('should return false for file path outside the directory', () => {
		const filePath = `${dirPath}/../../testfile.csv`;
		const { isFilePathInDirectory } = require('../../../../shared/helpers/file');
		const result = isFilePathInDirectory(filePath, dirPath);
		expect(result).toBe(false);
	});
});

describe('Test getPartialFilenameFromParams method', () => {
	const address = 'lskpg7qukha2nmu9483huwk8oty7q3pyevh3bohr4';
	const publicKey = '86cbecb2a176934e454f63e7ffa05783be6960d90002c5558dfd31397cd8f020';
	const partialFilenameExtension = '.json';

	it('should return partial filename when called with address', async () => {
		const params = { address, interval: interval.startEnd };
		const { getPartialFilenameFromParams } = require('../../../../shared/helpers/file');
		const partialFilename = await getPartialFilenameFromParams(params, interval.onlyStart);
		expect(partialFilename.endsWith(partialFilenameExtension)).toBeTruthy();
		expect(partialFilename).toContain(address);
		expect(partialFilename).toMatch(PARTIAL_FILENAME);
	});

	it('should return partial filename when called with publicKey', async () => {
		const params = { publicKey, interval: interval.onlyStart };
		const { getPartialFilenameFromParams } = require('../../../../shared/helpers/file');
		const partialFilename = await getPartialFilenameFromParams(params, interval.onlyStart);
		expect(partialFilename.endsWith(partialFilenameExtension)).toBeTruthy();
		expect(partialFilename).toContain(address);
		expect(partialFilename).toMatch(PARTIAL_FILENAME);
	});
});

describe('Excel export utils', () => {
	const address = 'lskeqretdgm6855pqnnz69ahpojk5yxfsv2am34et';
	const publicKey = 'b7fdfc991c52ad6646159506a8326d4203c868bd3f16b8043c8e4e034346e581';
	const chainID = '00000000';
	const excelFilenameExtension = '.xlsx';
	const excelFileUrlBeginsWith = '/api/v3/export/';

	describe('Test getExcelFilenameFromParams method', () => {
		it('should return excel filename when called with address and complete interval with start and end date supplied', async () => {
			const params = { address, interval: interval.startEnd };
			const { getExcelFilenameFromParams } = require('../../../../shared/helpers/file');
			const excelFilename = await getExcelFilenameFromParams(params, chainID);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});

		it('should return excel filename when called with publicKey and complete interval with start and end date supplied', async () => {
			const params = { publicKey, interval: interval.startEnd };
			const { getExcelFilenameFromParams } = require('../../../../shared/helpers/file');
			const excelFilename = await getExcelFilenameFromParams(params, chainID);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});

		it('should return excel filename when called with address and interval with only start date supplied', async () => {
			const params = { address, interval: interval.onlyStart };
			const { getExcelFilenameFromParams } = require('../../../../shared/helpers/file');
			const excelFilename = await getExcelFilenameFromParams(params, chainID);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});

		it('should return excel filename when called with publicKey and interval with only start date supplied', async () => {
			const params = { publicKey, interval: interval.onlyStart };
			const { getExcelFilenameFromParams } = require('../../../../shared/helpers/file');
			const excelFilename = await getExcelFilenameFromParams(params, chainID);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});

		xit('should return excel filename when called with address and no interval supplied', async () => {
			const params = { address };
			const { getExcelFilenameFromParams } = require('../../../../shared/helpers/file');
			const excelFilename = await getExcelFilenameFromParams(params, chainID);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});

		xit('should return excel filename when called with publicKey and no interval supplied', async () => {
			const params = { publicKey };
			const { getExcelFilenameFromParams } = require('../../../../shared/helpers/file');
			const excelFilename = await getExcelFilenameFromParams(params, chainID);
			expect(excelFilename.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilename).toContain(address);
			expect(excelFilename).toMatch(EXCEL_EXPORT_FILENAME);
		});
	});

	describe('Test getExcelFileUrlFromParams method', () => {
		it('should return excel filepath URL when called with address and complete interval with start and end date supplied', async () => {
			const params = { address, interval: interval.startEnd };
			const { getExcelFileUrlFromParams } = require('../../../../shared/helpers/file');
			const excelFilepathUrl = await getExcelFileUrlFromParams(params, chainID);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});

		it('should return excel filepath URL when called with publicKey and complete interval with start and end date supplied', async () => {
			const params = { publicKey, interval: interval.startEnd };
			const { getExcelFileUrlFromParams } = require('../../../../shared/helpers/file');
			const excelFilepathUrl = await getExcelFileUrlFromParams(params, chainID);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});

		it('should return excel filepath URL when called with address and interval with only start date supplied', async () => {
			const params = { address, interval: interval.onlyStart };
			const { getExcelFileUrlFromParams } = require('../../../../shared/helpers/file');
			const excelFilepathUrl = await getExcelFileUrlFromParams(params, chainID);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});

		it('should return excel filepath URL when called with publicKey and interval with only start date supplied', async () => {
			const params = { publicKey, interval: interval.onlyStart };
			const { getExcelFileUrlFromParams } = require('../../../../shared/helpers/file');
			const excelFilepathUrl = await getExcelFileUrlFromParams(params, chainID);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});

		it('should return excel filepath URL when called with address and no interval supplied', async () => {
			const params = { address };

			jest.mock(mockedChainFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { getNetworkStatus, getBlocks } = require(mockedChainFilePath);
			getNetworkStatus.mockResolvedValueOnce({
				data: {
					genesisHeight: 1,
				},
			});

			getBlocks.mockResolvedValueOnce({
				data: [
					{
						timestamp: 1704198870,
					},
				],
			});

			const { getExcelFileUrlFromParams } = require('../../../../shared/helpers/file');

			const excelFilepathUrl = await getExcelFileUrlFromParams(params, chainID);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});

		it('should return excel filepath URL when called with publicKey and no interval supplied', async () => {
			const params = { publicKey };

			jest.mock(mockedChainFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { getNetworkStatus, getBlocks } = require(mockedChainFilePath);
			getNetworkStatus.mockResolvedValueOnce({
				data: {
					genesisHeight: 1,
				},
			});

			getBlocks.mockResolvedValueOnce({
				data: [
					{
						timestamp: 1704198870,
					},
				],
			});

			const { getExcelFileUrlFromParams } = require('../../../../shared/helpers/file');

			const excelFilepathUrl = await getExcelFileUrlFromParams(params, chainID);
			expect(excelFilepathUrl.startsWith(excelFileUrlBeginsWith)).toBeTruthy();
			expect(excelFilepathUrl.endsWith(excelFilenameExtension)).toBeTruthy();
			expect(excelFilepathUrl).toContain(address);
			expect(excelFilepathUrl).toMatch(EXCEL_FILE_URL);
		});
	});
});
