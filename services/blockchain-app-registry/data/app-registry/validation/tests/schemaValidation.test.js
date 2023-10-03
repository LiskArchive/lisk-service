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

const { validateAllSchemas } = require('../src/schemaValidation');
const config = require('../config');
const invalidNativeTokensConfig = require('./constants/invalidNativeTokensConfig');
const invalidAppConfig = require('./constants/invalidAppConfig');
const validConfig = require('./constants/validConfig');
const setup = require('./helper/setup');

let filesToTest;

describe('Schema Validation Tests', () => {
	beforeAll(async () => {
		// Create a temporary directory and some files for testing
		await setup.createTestEnvironment();
		filesToTest = setup.getJSONFilesFromNetwork();
	});

	afterAll(async () => {
		// Remove the temporary directory and files created during testing
		await setup.cleanTestEnvironment();
	});

	it('should not have validation errors while validating correct schema', async () => {
		/* eslint-disable max-len */
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBe(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
		/* eslint-enable max-len */
	});

	it('should have validation errors while validating schema for app.json without background color', async () => {
		/* eslint-disable max-len */
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(invalidAppConfig.backgroundColorNotPresent));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
		/* eslint-enable max-len */
	});

	it('should have validation errors while validating schema for app.json without chain ID', async () => {
		/* eslint-disable max-len */
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(invalidAppConfig.chainIDNotPresent));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
		/* eslint-enable max-len */
	});

	it('should have validation errors while validating schema for app.json without chainName', async () => {
		/* eslint-disable max-len */
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(invalidAppConfig.chainNameNotPresent));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for app.json without explorers', async () => {
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(invalidAppConfig.explorersNotPresent));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for app.json without genesis url', async () => {
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(invalidAppConfig.genesisURLNotPresent));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for app.json without logo', async () => {
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(invalidAppConfig.logoNotPresent));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for app.json without network type', async () => {
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(invalidAppConfig.networkTypeNotPresent));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for app.json without project page', async () => {
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(invalidAppConfig.projectPageNotPresent));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for app.json without service url', async () => {
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(invalidAppConfig.serviceURLsNotPresent));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for app.json with incorrect Service url', async () => {
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(invalidAppConfig.serviceUrlIncorrect));
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(validConfig.nativeTokenConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json with incorrect tokens type', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.tokensIncorrect));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json without tokens', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.tokensNotPresent));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json with without token ID', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.tokenIDNotPresent,
		));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json without token name', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.tokenNameNotPresent));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json without denom units', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.denomUnitsNotPresent));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json with incorrect denomUnits.decimals', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.denomUnitsDecimalsIncorrect));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json without displayUnits.decimals', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.denomUnitsDecimalsNotPresent));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json without displayUnits.denom', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.denomUnitsDenomNotPresent));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json without base denom', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.baseDenomNotPresent));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json without display denom', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.displayDenomNotPresent));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json without Symbol', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.symbolNotPresent));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json without PNG logo', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.logoPngNotPresent));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json without SVG logo', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.logoSvgNotPresent));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json with incorrect PNG logo URL', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.logoPNGIncorrect));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});

	it('should have validation errors while validating schema for nativetokens.json with incorrect SVG logo URL', async () => {
		await setup.createFileInNetwork(config.filename.NATIVE_TOKENS, JSON.stringify(invalidNativeTokensConfig.logoSVGIncorrect));
		await setup.createFileInNetwork(config.filename.APP_JSON, JSON.stringify(validConfig.appConfig));

		const schemaErrors = await validateAllSchemas(filesToTest);
		expect(schemaErrors.length).toBeGreaterThan(0);

		await setup.removeFileFromNetwork(config.filename.APP_JSON);
		await setup.removeFileFromNetwork(config.filename.NATIVE_TOKENS);
	});
});
