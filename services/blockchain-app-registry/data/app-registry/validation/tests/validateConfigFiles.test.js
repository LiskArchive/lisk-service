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

const { validateAllConfigFiles } = require('../src/validateConfigFiles');
const validConfig = require('./constants/validConfig');
const setup = require('./helper/setup');
const config = require('../config');

describe('Configs in network directories validation tests', () => {
	beforeAll(async () => {
		// Create a temporary directory and some files for testing
		await setup.createTestEnvironment();
	});

	afterAll(async () => {
		// Remove the temporary directory and files created during testing
		await setup.cleanTestEnvironment();
	});

	it('should not have validation errors when app.json and nativetokens.json is present in all network directories', async () => {
		/* eslint-disable max-len */
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const configFileErrors = await validateAllConfigFiles(setup.getAppDirs());
		expect(configFileErrors.length).toBe(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
		/* eslint-enable max-len */
	});

	it('should have validation errors when app.json is not present in any network directories', async () => {
		/* eslint-disable-next-line max-len */
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const configFileErrors = await validateAllConfigFiles(setup.getAppDirs());
		expect(configFileErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors when nativetokens.json is not present in any network directories', async () => {
		/* eslint-disable-next-line max-len */
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const configFileErrors = await validateAllConfigFiles(setup.getAppDirs());
		expect(configFileErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
	});
});
