/*
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
 */

const { validateAllWhitelistedFiles, isFileWhitelisted } = require('../src/validateWhitelistedFiles');
const validConfig = require('./constants/validConfig');
const setup = require('./helper/setup');
const config = require('../config');

describe('Whitelisted Files Tests', () => {
	beforeAll(async () => {
		// Create a temporary directory and some files for testing
		await setup.createTestEnvironment();
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));
	});

	afterAll(async () => {
		// Remove the temporary directory and files created during testing
		await setup.cleanTestEnvironment();
	});

	it('should not have validation errors for whitelisted files and directories', async () => {
		const whitelistedFilesErrors = await validateAllWhitelistedFiles(setup.getJSONFilesFromNetwork());
		expect(whitelistedFilesErrors.length).toBe(0);
	});

	it('should have validation errors for non-whitelisted files', async () => {
		await setup.createFileInNetwork('tempfile.js', 'console.log("hello world");');
		const files = [setup.getFileFromNetwork('tempfile.js')];

		const whitelistedFilesErrors = await validateAllWhitelistedFiles(files);
		expect(whitelistedFilesErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork('tempfile.js');
	});
});

describe('isFileWhitelisted function', () => {
	test('should return true when pattern is present at the end of filename', () => {
		const filename = 'app.json';
		const patterns = ['*.json', 'app.*'];
		expect(isFileWhitelisted(filename, patterns)).toBe(true);
	});

	test('should return true when pattern with wildcard is present at the end of filename', () => {
		const filename = 'image.png';
		const patterns = ['*.png', '*.jpg'];
		expect(isFileWhitelisted(filename, patterns)).toBe(true);
	});

	test('should return true when pattern with wildcard is present at the start of filename', () => {
		const filename = 'logo.svg';
		const patterns = ['*.svg', 'logo*'];
		expect(isFileWhitelisted(filename, patterns)).toBe(true);
	});

	test('should return false when pattern is not present in filename', () => {
		const filename = 'file.txt';
		const patterns = ['*.json', 'app.*'];
		expect(isFileWhitelisted(filename, patterns)).toBe(false);
	});

	test('should return false when no pattern is given', () => {
		const filename = 'app.json';
		const patterns = [];
		expect(isFileWhitelisted(filename, patterns)).toBe(false);
	});
});
