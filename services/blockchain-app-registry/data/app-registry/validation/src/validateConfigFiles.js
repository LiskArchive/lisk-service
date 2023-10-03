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

const fs = require('fs').promises;
const config = require('../config');

const validateAllConfigFilesInDir = async (directory) => {
	const validationErrors = [];

	try {
		const files = await fs.readdir(directory);

		if (!files.includes(config.filename.APP_JSON) || !files.includes(config.filename.NATIVE_TOKENS)) {
			validationErrors.push(`Files '${config.filename.APP_JSON}' and '${config.filename.NATIVE_TOKENS}' are not present in directory ${directory}.`);
		}
	} catch (err) {
		validationErrors.push(`Validation of directory (${directory}) failed with error: ${err.message}`);
	}

	return validationErrors;
};

const validateAllConfigFiles = async (networkDirs) => {
	let validationErrors = [];
	for (let i = 0; i < networkDirs.length; i++) {
		/* eslint-disable no-await-in-loop */
		const configFilesValidationError = await validateAllConfigFilesInDir(networkDirs[i]);
		validationErrors = [...validationErrors, ...configFilesValidationError];
		/* eslint-enable no-await-in-loop */
	}
	return validationErrors;
};

module.exports = {
	validateAllConfigFiles,
};
