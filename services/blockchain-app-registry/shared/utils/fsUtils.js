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

const stats = filePath => new Promise((resolve, reject) => {
	fs.stat(filePath, (err, stat) => {
		if (err) {
			logger.error(err);
			return reject(err);
		}
		return resolve(stat);
	});
});

const exists = (filePath) => new Promise((resolve) => {
	fs.access(filePath, (err) => {
		if (err) {
			return resolve(false);
		}
		return resolve(true);
	});
});

const mkdir = async (directoryPath, options = { recursive: true }) => {
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

const rmdir = async (directoryPath, options = { recursive: true }) => {
	logger.debug(`Creating directory: ${directoryPath}`);
	await fs.rmdir(
		directoryPath,
		options,
		(err) => {
			if (err) logger.error(`Error when removing directory: ${directoryPath}\n`, err.message);
			else logger.debug(`Successfully removed directory: ${directoryPath}`);
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

const write = (filePath, content) => new Promise((resolve, reject) => {
	fs.writeFile(filePath, content, (err) => {
		if (err) {
			logger.error(err);
			return reject(err);
		}
		return resolve();
	});
});

const getDirectories = (directoryPath, options = { withFileTypes: true }) => new Promise(
	(resolve, reject) => {
		fs.readdir(directoryPath, options, (err, files) => {
			if (err) {
				logger.error(err);
				return reject(err);
			}
			const directoriesInDirectory = files
				.filter((dir) => dir.isDirectory())
				.map((dir) => path.join(directoryPath, dir.name));

			return resolve(directoriesInDirectory);
		});
	});

const getFiles = (directoryPath, options = { withFileTypes: true }) => new Promise(
	(resolve, reject) => {
		fs.readdir(directoryPath, options, (err, files) => {
			if (err) {
				logger.error(err);
				return reject(err);
			}
			const filesInDirectory = files
				.filter((file) => file.isFile())
				.map((file) => path.join(directoryPath, file.name));

			return resolve(filesInDirectory);
		});
	});

const rename = async (olddir, newDir) => {
	await fs.rename(olddir, newDir, (err) => {
		if (err) logger.error('Error when renaming directory:', err.message);
		else logger.debug('Successfully renamed directory');
	});
};

module.exports = {
	exists,
	mkdir,
	rmdir,
	getDirectories,
	read,
	write,
	getFiles,
	rename,
	stats,
};
