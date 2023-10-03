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
const path = require('path');
const config = require('../config');
const { readFileLinesToArray } = require('./utils/fs');

const isPatternMatch = (str, pattern) => {
	if (pattern === '*') {
		return true;
	}
	if (pattern.startsWith('*')) {
		return str.endsWith(pattern.slice(1));
	}
	if (pattern.endsWith('*')) {
		return str.startsWith(pattern.slice(0, -1));
	}
	return str === pattern;
};

const isFileWhitelisted = (filename, patterns) => {
	for (let i = 0; i < patterns.length; i++) {
		const pattern = patterns[i];
		if (isPatternMatch(filename, pattern)) {
			return true;
		}
	}
	return false;
};

const validateAllWhitelistedFiles = async (filePaths) => {
	const validationErrors = [];
	const whitelistedFilePatterns = await readFileLinesToArray(config.whitelistedFilesPath);

	for (let i = 0; i < filePaths.length; i++) {
		const filePath = path.resolve(config.rootDir, filePaths[i]);

		/* eslint-disable no-await-in-loop */
		const stat = await fs.stat(filePath);

		if (stat.isFile() && !isFileWhitelisted(path.basename(filePath), whitelistedFilePatterns)) {
			validationErrors.push(`User is not permitted to modify the file: ${filePath}.`);
		}
		/* eslint-enable no-await-in-loop */
	}

	return validationErrors;
};

module.exports = {
	validateAllWhitelistedFiles,

	// Testing
	isFileWhitelisted,
};
