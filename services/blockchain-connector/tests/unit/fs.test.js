/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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

const fs = require('fs');
const tar = require('tar');
const { extractTarBall } = require('../../shared/utils/fs'); // Replace './your-module' with the actual path to your module.

// Mock the 'fs' and 'tar' modules
jest.mock('fs');
jest.mock('tar');

describe('extractTarBall function', () => {
	const filePath = '/path/to/archive.tar';
	const directoryPath = '/path/to/extract';

	beforeEach(() => {
		// Clear mock function calls and reset mock implementation before each test
		fs.createReadStream.mockClear();
		tar.extract.mockClear();
	});

	it('should extract tarball successfully', async () => {
		// Mock fs.createReadStream to return a readable stream
		const fileStreamMock = {
			pipe: jest.fn(),
			on: jest.fn((event, callback) => {
				if (event === 'end') {
					callback(); // Simulate the 'end' event to trigger the resolve() path
				}
			}),
		};
		fs.createReadStream.mockReturnValue(fileStreamMock);

		await expect(extractTarBall(filePath, directoryPath)).resolves.toBeUndefined();

		// Verify fs.createReadStream is called with the correct arguments
		expect(fs.createReadStream).toHaveBeenCalledWith(filePath);

		// Verify tar.extract is called with the correct arguments
		expect(tar.extract).toHaveBeenCalledWith({ cwd: directoryPath });

		// Verify pipe is called with the correct argument
		expect(fileStreamMock.pipe).toHaveBeenCalledWith(tar.extract({ cwd: directoryPath }));
	});

	it('should reject with an error when fs.createReadStream encounters an error', async () => {
		// Mock fs.createReadStream to return a readable stream
		const fileStreamMock = {
			pipe: jest.fn(),
			on: jest.fn((event, callback) => {
				if (event === 'error') {
					callback(new Error('Some error'));
				}
			}),
		};
		fs.createReadStream.mockReturnValue(fileStreamMock);

		await expect(extractTarBall(filePath, directoryPath)).rejects.toThrowError('Some error');

		// Verify fs.createReadStream is called with the correct arguments
		expect(fs.createReadStream).toHaveBeenCalledWith(filePath);
	});
});
