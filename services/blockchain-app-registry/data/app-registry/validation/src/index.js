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
const colors = require('ansi-colors');
const { validateAllSchemas } = require('./schemaValidation');
const { validateURLs } = require('./validateURLs');
const { validateAllWhitelistedFiles } = require('./validateWhitelistedFiles');
const { validateAllConfigFiles } = require('./validateConfigFiles');
const { validateConfigFilePaths } = require('./validateConfigFilePaths');
const { exists } = require('./utils/fs');
const config = require('../config');

const drawBorder = (messages) => {
	const maxLength = 165; // Maximum characters per line
	const horizontalLine = '─'.repeat(maxLength + 4); // Create a horizontal line
	const border = colors.yellow(`┌${horizontalLine}┐\n`); // Top border

	const content = messages.map((msg) => {
		const lines = msg.split('\n'); // Split message by newline
		const formattedLines = lines.map((line) => {
			const chunks = line.match(new RegExp(`.{1,${maxLength}}`, 'g')) || []; // Split line into chunks
			const formattedChunks = chunks.map((chunk) => {
				const padding = ' '.repeat(maxLength - colors.unstyle(chunk).length);
				return colors.yellow('│  ') + colors.white(`${chunk}${padding}`) + colors.yellow('  │\n');
			}).join('');
			return formattedChunks;
		}).join('');
		return formattedLines;
	}).join(''); // Messages content with padding

	const bottomBorder = colors.yellow(`└${horizontalLine}┘\n`); // Bottom border
	return border + content + bottomBorder;
};

const validate = async () => {
	let validationErrors = [];

	// Check if the PR author is from the @LiskHQ/platform team
	const isAuthorFromDevTeam = process.argv[2] === 'true';

	// Get all modified files
	const allChangedFiles = process.argv.slice(3);

	// Get all app dir added or modified inside network dirs
	const changedAppDirs = new Set();
	for (let i = 0; i < allChangedFiles.length; i++) {
		const dir = allChangedFiles[i].split('/').slice(0, 2).join('/');
		if (dir.trim() && config.knownNetworks.includes(dir.split('/')[0])) {
			changedAppDirs.add(path.resolve(dir));
		} else if (!isAuthorFromDevTeam) {
			validationErrors.push(`File (${allChangedFiles[i]}) does not belong to a known network.`);
		}
	}

	// Filter all changed app.json and nativetokens.json files except from Schema dir
	const changedAppFiles = [];
	// eslint-disable-next-line no-restricted-syntax
	for (const fileName of allChangedFiles) {
		const baseName = path.basename(fileName);
		const fullPath = path.join(config.rootDir, fileName);
		const isSchemaFile = fullPath.includes(config.schemaDir);

		/* eslint-disable no-await-in-loop */
		if (await exists(fullPath)) {
			const isAppOrNativeTokens = baseName === config.filename.APP_JSON || baseName === config.filename.NATIVE_TOKENS;
			const isSchemaAppOrNativeTokens = isSchemaFile && isAppOrNativeTokens;

			if (isAppOrNativeTokens && !isSchemaAppOrNativeTokens) {
				changedAppFiles.push(fullPath);
			}
		}
		/* eslint-enable no-await-in-loop */
	}

	// Validate if app.json and nativetoken.json is present anywhere except networkDir/appName/
	const configFileErrors = await validateConfigFilePaths(changedAppFiles);

	// Validate all app.json and nativetoken.json schemas
	const schemaErrors = await validateAllSchemas(changedAppFiles);

	// Check for config files in all changed apps in networks directories
	const validateConfigFilesErrors = await validateAllConfigFiles(changedAppDirs);

	// Validate serviceURLs
	const urlErrors = await validateURLs(changedAppFiles, allChangedFiles);

	// Merge all validation errors
	validationErrors = [...configFileErrors, ...schemaErrors, ...validateConfigFilesErrors, ...urlErrors];

	// Check if any non-whitelisted files are modified
	if (!isAuthorFromDevTeam) {
		const whitelistedFilesErrors = await validateAllWhitelistedFiles(allChangedFiles);
		validationErrors = [...validationErrors, ...whitelistedFilesErrors];
	}

	if (validationErrors.length > 0) {
		validationErrors = [
			colors.bold.underline.red('The following validations have failed. Please address them to proceed:\n\n'),
			...validationErrors.map((message, index) => colors.white(`${index + 1}. ${message}`)),
		];

		// eslint-disable-next-line no-console
		console.log(drawBorder(validationErrors));
		process.exit(1);
	}

	process.exit(0);
};

validate();
