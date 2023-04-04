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
const { ALLOWED_FILES, ALLOWED_FILE_EXTENSIONS } = require('../constants');

const logger = Logger();

const stats = async (filePath) => new Promise((resolve, reject) => {
	fs.stat(
		filePath,
		(err, stat) => {
			if (err) {
				logger.error(err);
				return reject(err);
			}

			return resolve(stat);
		},
	);
});

const exists = async (resourcePath) => new Promise((resolve) => {
	logger.trace(`Checking if resource exists: ${resourcePath}.`);
	fs.access(
		resourcePath,
		(err) => {
			if (err) {
				logger.trace(`Error when checking if resource exists: ${resourcePath}.\n`, err);
				return resolve(false);
			}

			logger.trace(`Successfully validated that resource exists: ${resourcePath}.`);
			return resolve(true);
		},
	);
});

const mkdir = async (directoryPath, options = { recursive: true }) => new Promise(
	(resolve, reject) => {
		logger.trace(`Creating directory: ${directoryPath}.`);
		fs.mkdir(
			directoryPath,
			options,
			(err) => {
				if (err) {
					logger.error(`Error when creating directory: ${directoryPath}.\n`, err);
					return reject(err);
				}

				logger.debug(`Successfully created directory: ${directoryPath}.`);
				return resolve();
			},
		);
	},
);

const rm = async (deletePath, options) => new Promise((resolve) => {
	logger.trace(`Removing directory: ${deletePath}.`);
	fs.rm(
		deletePath,
		options,
		(err) => {
			if (err) {
				logger.error(`Error when removing file/directory: ${deletePath}.\n`, err);
				return resolve(false);
			}

			logger.debug(`Successfully removed file/directory: ${deletePath}`);
			return resolve(true);
		},
	);
});

const rmdir = async (directoryPath, options) => rm(
	directoryPath,
	{ ...options, recursive: true },
);

const read = async (filePath) => new Promise((resolve, reject) => {
	logger.trace(`Reading file: ${filePath}.`);
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			logger.error(`Error when reading file: ${filePath}.\n`, err);
			return reject(err);
		}

		logger.trace(`Successfully read contents from file: ${filePath}.`);
		return resolve(data);
	});
});

const write = async (filePath, content) => new Promise((resolve, reject) => {
	logger.trace(`Writing to file: ${filePath}.`);
	fs.writeFile(filePath, content, (err) => {
		if (err) {
			logger.error(`Error when writing to file: ${filePath}.\n`, err);
			return reject(err);
		}

		logger.trace(`Successfully wrote contents to file: ${filePath}.`);
		return resolve();
	});
});

const getDirectories = async (directoryPath, options = { withFileTypes: true }) => new Promise(
	(resolve, reject) => {
		logger.trace(`Reading sub-directories in: ${directoryPath}.`);
		fs.readdir(
			directoryPath,
			options,
			async (err, dirs) => {
				if (err) {
					logger.error(`Error when reading directory: ${directoryPath}.\n`, err);
					return reject(err);
				}

				const subDirsWithTime = [];
				const subDirectories = dirs.filter((subDir) => subDir.isDirectory());
				for (let i = 0; i < subDirectories.length; i++) {
					const fullSubDirPath = path.join(directoryPath, subDirectories[i].name);
					// eslint-disable-next-line no-await-in-loop
					const stat = await stats(fullSubDirPath);
					subDirsWithTime.push({ name: fullSubDirPath, time: stat.ctime.getTime() });
				}

				const sortedDirs = subDirsWithTime
					.sort((a, b) => b.time - a.time)
					.map(file => file.name);

				logger.trace(`Successfully read sub-directories in directory: ${directoryPath}.`);
				return resolve(sortedDirs);
			},
		);
	},
);

const getFiles = async (directoryPath, options = { withFileTypes: true }) => new Promise(
	(resolve, reject) => {
		logger.trace(`Reading files in directory: ${directoryPath}.`);
		fs.readdir(directoryPath, options, (err, files) => {
			if (err) {
				logger.error(`Error when files in directory: ${directoryPath}.\n`, err);
				return reject(err);
			}
			const filesInDirectory = files
				.filter((file) => file.isFile())
				.map((file) => path.join(directoryPath, file.name));

			logger.trace(`Successfully read files in directory: ${directoryPath}.`);
			return resolve(filesInDirectory);
		});
	});

const rename = async (oldName, newName) => new Promise((resolve, reject) => {
	logger.trace(`Renaming resource: ${oldName} to ${newName}.`);
	fs.rename(oldName, newName, (err) => {
		if (err) {
			logger.error(`Error while renaming resource: ${oldName} to ${newName}.\n`, err);
			return reject(err);
		}

		logger.trace(`Successfully renamed resource: ${oldName} to ${newName}.`);
		return resolve();
	});
});

const deleteFolderIfEmpty = async (folderPath) => {
	const files = await fs.promises.readdir(folderPath);

	if (files.length === 0) {
		await fs.promises.rmdir(folderPath);
		logger.trace(`Deleted folder: ${folderPath}`);
	}
};

const deleteEmptyFoldersAndNonMetaFiles = async (folderPath) => {
	const files = await fs.promises.readdir(folderPath);

	for (let i = 0; i < files.length; i++) {
		/* eslint-disable no-await-in-loop */
		const file = files[i];
		const filePath = path.join(folderPath, file);
		const isDirectory = (await fs.promises.lstat(filePath)).isDirectory();

		if (isDirectory) {
			await deleteEmptyFoldersAndNonMetaFiles(filePath);
			await deleteFolderIfEmpty(filePath);
		} else {
			const fileName = path.basename(filePath);

			if (!ALLOWED_FILE_EXTENSIONS.some((ending) => file.endsWith(ending))
					&& !ALLOWED_FILES.some((name) => fileName === name)) {
				await fs.promises.unlink(filePath);
				logger.trace(`Deleted file: ${filePath}`);
			}
		}
		/* eslint-enable no-await-in-loop */
	}
};

const mv = async (source, target) => rename(source, target);

module.exports = {
	exists,
	mkdir,
	rm,
	rmdir,
	getDirectories,
	read,
	write,
	getFiles,
	rename,
	mv,
	stats,
	deleteEmptyFoldersAndNonMetaFiles,
};
