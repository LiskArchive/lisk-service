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
const {
	Logger,
} = require('lisk-service-framework');
const { promises: { readdir } } = require('fs');

const fs = require('fs');
const tar = require('tar');
const camelCase = require('camelcase');
const requireAll = require('require-all');

const logger = Logger();

const getAllDirectories = async (sourceDirPath) => {
	const dirEntries = await readdir(sourceDirPath, { withFileTypes: true });
	const directories = dirEntries.filter(dirent => dirent.isDirectory());
	const dirNames = directories.map(dirent => dirent.name);
	return dirNames;
};

const getAllJSFiles = async (
	sourceDirPath,
	pascalCase = false,
	preserveConsecutiveUppercase = true,
) => requireAll({
	dirname: sourceDirPath,
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
	map: (fileName) => {
		const formattedFileName = camelCase(
			fileName,
			{ pascalCase, preserveConsecutiveUppercase },
		);
		return formattedFileName;
	},
});

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

const extractTarBall = async (filePath, directoryPath) => new Promise((resolve, reject) => {
	const fileStream = fs.createReadStream(filePath);
	fileStream.pipe(tar.extract({ cwd: directoryPath }));
	fileStream.on('error', async (err) => reject(new Error(err)));
	fileStream.on('end', async () => {
		logger.debug('File extracted successfully.');
		resolve();
	});
});

module.exports = {
	getAllDirectories,
	getAllJSFiles,
	exists,
	read,
	mkdir,
	rm,
	extractTarBall,
};
