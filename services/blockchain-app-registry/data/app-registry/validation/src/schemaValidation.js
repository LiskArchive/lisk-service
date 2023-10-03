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

const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const config = require('../config');
const { readJsonFile } = require('./utils/fs');

const appSchema = require(`${config.schemaDir}/${config.filename.APP_JSON}`); // eslint-disable-line import/no-dynamic-require
const nativeTokenSchema = require(`${config.schemaDir}/${config.filename.NATIVE_TOKENS}`); // eslint-disable-line import/no-dynamic-require

const ajv = new Ajv();
addFormats(ajv);
ajv.addKeyword('example');

const validateChainName = async (filePaths) => {
	const validationErrors = [];

	for (let i = 0; i < filePaths.length; i++) {
		/* eslint-disable no-await-in-loop */
		const filePath = filePaths[i];
		const data = await readJsonFile(filePath);
		const parentDirName = path.basename(path.dirname(filePath));

		const chainNameFromFile = data && data.chainName ? data.chainName.toLowerCase() : undefined;
		const displayNameFromFile = data && data.displayName ? data.displayName.toLowerCase() : undefined;
		if (chainNameFromFile !== parentDirName.toLowerCase() && displayNameFromFile !== parentDirName.toLowerCase()) {
			validationErrors.push(`Parent directory name neither matches the chainName nor the displayName in ${filePaths[i]}.`);
		}
		/* eslint-enable no-await-in-loop */
	}

	return validationErrors;
};

const validateSchema = async (schema, filePaths) => {
	const validationErrors = [];

	for (let i = 0; i < filePaths.length; i++) {
		/* eslint-disable no-await-in-loop */
		const filePath = filePaths[i];
		const data = await readJsonFile(filePath);
		const valid = ajv.validate(schema, data);

		if (!valid) {
			validationErrors.push(JSON.stringify(ajv.errors));
		}
		/* eslint-enable no-await-in-loop */
	}

	return validationErrors;
};

const validateAllSchemas = async (files) => {
	// Get all app.json files
	const appFiles = files.filter((filename) => filename.endsWith(config.filename.APP_JSON));

	// Get all nativetokens.json files
	const nativeTokenFiles = files.filter((filename) => filename.endsWith(config.filename.NATIVE_TOKENS));

	// Validate schemas
	const appSchemaValidationErrors = await validateSchema(appSchema, appFiles);
	const nativeTokensSchemaValidationErrors = await validateSchema(nativeTokenSchema, nativeTokenFiles);

	// Validate if dir name is same as network name
	const chainNameValidationErrors = await validateChainName(appFiles);

	return [...appSchemaValidationErrors, ...nativeTokensSchemaValidationErrors, ...chainNameValidationErrors];
};

module.exports = {
	validateAllSchemas,
};
