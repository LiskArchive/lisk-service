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
const path = require('path');
const fs = require('fs');

const { Logger } = require('lisk-service-framework');

const logger = Logger();

const exists = async (filePath) => {
	try {
		await fs.promises.access(filePath);
		return true;
	} catch (_) {
		return false;
	}
};

const mkdir = async (directoryPath, options = { recursive: true, mode: '0o777' }) => {
	logger.debug(`Creating directory: ${directoryPath}`);
	await fs.mkdir(
		directoryPath,
		options,
		(err) => {
			if (err) logger.error(`Error when creating directory: ${directoryPath}\n`, err.message);
			else logger.debug(`Successfully created directory: ${directoryPath}`);
		},
	);
};

const read = (filePath) => new Promise((resolve, reject) => {
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			logger.error(err);
			return reject(err);
		}
		return resolve(data);
	});
});

const isDirectory = directoryPath => fs.lstatSync(directoryPath).isDirectory();

const isFile = directoryPath => fs.lstatSync(directoryPath).isFile();

const getDirectories = async (directoryPath, options = { withFileTypes: true }) => {
	const allDir = await fs.promises.readdir(directoryPath, options);
	return allDir
		.map(dir => path.join(directoryPath, dir.name)).filter(isDirectory);
};

const getFiles = async (directoryPath, options = { withFileTypes: true }) => {
	const allDir = await fs.promises.readdir(directoryPath, options);
	return allDir
		.map(dir => path.join(directoryPath, dir.name)).filter(isFile);
};

const rename = async (olddir, newDir) => {
	await fs.rename(olddir, newDir, (err) => {
		if (err) logger.error('Error when renaming directory:', err.message);
		else logger.debug('Successfully renamed directory');
	});
};

module.exports = {
	exists,
	mkdir,
	getDirectories,
	read,
	getFiles,
	rename,
};
