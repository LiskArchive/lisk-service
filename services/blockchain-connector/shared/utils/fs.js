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

const { Logger } = require('lisk-service-framework');

const logger = Logger();

const exists = async (path) => {
	try {
		await fs.promises.access(path);
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

const rm = async (directoryPath, options = {}) => {
	await fs.rm(
		directoryPath,
		options,
		(err) => {
			if (err) logger.error(`Error when removing directory: ${directoryPath}\n`, err.message);
			return !err;
		},
	);
};

const extractTarBall = async (filePath, directoryPath) => fs
	.createReadStream(filePath)
	.pipe(tar.extract({ cwd: directoryPath }));

module.exports = {
	exists,
	extractTarBall,
	mkdir,
	read,
	rm,
};
