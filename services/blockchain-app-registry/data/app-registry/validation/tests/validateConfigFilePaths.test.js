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

const { validateConfigFilePaths } = require('../src/validateConfigFilePaths');
const config = require('../config');
const validConfig = require('./constants/validConfig');
const setup = require('./helper/setup');

describe('Schema Validation Tests', () => {
	beforeAll(async () => {
		// Create a temporary directory and some files for testing
		await setup.createTestEnvironment();
	});

	afterAll(async () => {
		// Remove the temporary directory and files created during testing
		await setup.cleanTestEnvironment();
	});

	it('should not have validation errors if config files are present in network dir', async () => {
		/* eslint-disable max-len */
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const configFilePathsErrors = await validateConfigFilePaths(setup.getJSONFilesFromNetwork());
		expect(configFilePathsErrors.length).toBe(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
		/* eslint-enable max-len */
	});

	it('should have validation errors if config files are present in non network dir', async () => {
		/* eslint-disable max-len */
		await setup.createFileInDocs(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));
		await setup.createFileInDocs(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const configFilePathsErrors = await validateConfigFilePaths(setup.getJSONFilesFromDocs());
		expect(configFilePathsErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromDocs(config.filename.APP_JSON);
		await setup.removeFileFromDocs(config.filename.NATIVE_TOKENS);
		/* eslint-enable max-len */
	});
});
