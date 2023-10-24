/*
 * LiskHQ/lisk-service
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
 *
 */
const path = require('path');
const fs = require('fs');
const Logger = require('./logger').get;

const logger = Logger();

const mkdir = (dirPath, options = { recursive: true }) =>
	// eslint-disable-next-line implicit-arrow-linebreak
	new Promise((resolve, reject) => {
		logger.debug(`Creating directory: ${dirPath}`);
		return fs.mkdir(dirPath, options, err => {
			if (err) {
				logger.error(`Error when creating directory: ${dirPath}\n`, err.message);
				return reject(err);
			}
			logger.debug(`Successfully created directory: ${dirPath}.`);
			return resolve();
		});
	});

const read = filePath =>
	// eslint-disable-next-line implicit-arrow-linebreak
	new Promise((resolve, reject) => {
		fs.promises
			.readFile(filePath, 'utf8')
			.then(data => {
				resolve(data);
			})
			.catch(error => {
				reject(error);
			});
	});

const write = (filePath, content) =>
	// eslint-disable-next-line implicit-arrow-linebreak
	new Promise((resolve, reject) => {
		fs.writeFile(filePath, content, err => {
			if (err) {
				logger.error(err);
				return reject(err);
			}
			return resolve();
		});
	});

const isFilePathInDirectory = (filePath, directory) => {
	const absoluteFilePath = path.resolve(filePath);
	const absoluteRootDir = path.resolve(directory);

	if (!absoluteFilePath.startsWith(absoluteRootDir)) {
		logger.warn('Filepath is not allowed.');
		return false;
	}

	return true;
};

const rm = async (deletePath, options) =>
	// eslint-disable-next-line implicit-arrow-linebreak
	new Promise(resolve => {
		logger.trace(`Removing directory: ${deletePath}.`);
		fs.rm(deletePath, options, err => {
			if (err) {
				logger.error(`Error when removing file/directory: ${deletePath}.\n`, err);
				return resolve(false);
			}

			logger.debug(`Successfully removed file/directory: ${deletePath}`);
			return resolve(true);
		});
	});

const rmdir = async (directoryPath, options) =>
	// eslint-disable-next-line implicit-arrow-linebreak
	rm(directoryPath, {
		...options,
		force: true,
		maxRetries: 3,
		recursive: true,
		retryDelay: 50,
	});

const fileExists = async filePath => !!(await fs.promises.stat(filePath).catch(() => null));

// eslint-disable-next-line consistent-return
const exists = filePath =>
	// eslint-disable-next-line implicit-arrow-linebreak, consistent-return
	new Promise(resolve => {
		if (typeof filePath !== 'string') return resolve(false);

		fs.access(filePath, err => {
			if (err) {
				return resolve(false);
			}
			return resolve(true);
		});
	});

const isFile = async filePath => {
	const isExists = await exists(filePath);

	if (isExists) {
		try {
			const stats = await fs.promises.lstat(filePath);
			return stats.isFile();
		} catch (error) {
			return false;
		}
	}

	return false;
};

const stats = async filePath =>
	// eslint-disable-next-line implicit-arrow-linebreak
	new Promise((resolve, reject) => {
		fs.stat(filePath, (err, stat) => {
			if (err) {
				logger.error(err);
				return reject(err);
			}

			return resolve(stat);
		});
	});

// eslint-disable-next-line max-len
const getDirectories = async (directoryPath, options = { withFileTypes: true }) =>
	// eslint-disable-next-line implicit-arrow-linebreak
	new Promise((resolve, reject) => {
		logger.trace(`Reading sub-directories in: ${directoryPath}.`);
		fs.readdir(directoryPath, options, async (err, dirs) => {
			if (err) {
				logger.error(`Error when reading directory: ${directoryPath}.\n`, err);
				return reject(err);
			}

			const subDirsWithTime = [];
			const subDirectories = dirs.filter(subDir => subDir.isDirectory());
			for (let i = 0; i < subDirectories.length; i++) {
				const fullSubDirPath = path.join(directoryPath, subDirectories[i].name);
				const stat = await stats(fullSubDirPath);
				subDirsWithTime.push({ name: fullSubDirPath, time: stat.ctime.getTime() });
			}

			const sortedDirs = subDirsWithTime.sort((a, b) => b.time - a.time).map(file => file.name);

			logger.trace(`Successfully read sub-directories in directory: ${directoryPath}.`);
			return resolve(sortedDirs);
		});
	});

// eslint-disable-next-line max-len
const getFiles = async (directoryPath, options = { withFileTypes: true }) =>
	// eslint-disable-next-line implicit-arrow-linebreak
	new Promise((resolve, reject) => {
		logger.trace(`Reading files in directory: ${directoryPath}.`);
		fs.readdir(directoryPath, options, (err, files) => {
			if (err) {
				logger.error(`Error when files in directory: ${directoryPath}.\n`, err);
				return reject(err);
			}
			const filesInDirectory = files
				.filter(file => file.isFile())
				.map(file => path.join(directoryPath, file.name));

			logger.trace(`Successfully read files in directory: ${directoryPath}.`);
			return resolve(filesInDirectory);
		});
	});

const getFilesAndDirs = async (directoryPath, options = { withFileTypes: true }) => {
	const subDirectories = await getDirectories(directoryPath, options);
	const filesInDirectory = await getFiles(directoryPath, options);
	return [...subDirectories, ...filesInDirectory];
};

const mv = async (oldName, newName) =>
	// eslint-disable-next-line implicit-arrow-linebreak
	new Promise((resolve, reject) => {
		logger.trace(`Renaming resource: ${oldName} to ${newName}.`);
		fs.rename(oldName, newName, err => {
			if (err) {
				logger.error(`Error while renaming resource: ${oldName} to ${newName}.\n`, err);
				return reject(err);
			}

			logger.trace(`Successfully renamed resource: ${oldName} to ${newName}.`);
			return resolve();
		});
	});

module.exports = {
	// Directory operations
	mkdir,
	rmdir,

	// File operations
	read,
	write,
	rm,
	mv,
	isFile,
	fileExists,
	isFilePathInDirectory,

	// Fetching
	getFiles,
	getDirectories,
	getFilesAndDirs,

	// Files and directories
	exists,
	stats,
};
