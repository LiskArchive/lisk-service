/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const BluebirdPromise = require('bluebird');
const path = require('path');
const fs = require('fs');
const {
	FileSystem: {
		stats,
		createDir,
		read,
		write,
		isFile,
		existsFile,
		isFilePathInDirectory,
		removeFile,
	},
	Logger,
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const {
	getDaysInMilliseconds,
} = require('./time');

const logger = Logger();

const list = (dirPath, count = 100, page = 0) => new Promise((resolve, reject) => {
	fs.readdir(
		dirPath,
		(err, files) => {
			if (err) {
				logger.error(err);
				return reject(err);
			}
			return resolve(files.slice(page, page + count));
		},
	);
});

const purge = (dirPath, days) => new Promise((resolve, reject) => {
	if (days === undefined) throw new ValidationException('days cannot be undefined');
	fs.readdir(dirPath, async (err, files) => {
		if (err) {
			logger.error(err);
			return reject(err);
		}
		await BluebirdPromise.map(
			files,
			async (file) => {
				const stat = await stats(path.join(dirPath, file));
				const currentTime = new Date().getTime();
				const expirationTime = new Date(stat.ctime).getTime() + getDaysInMilliseconds(days);
				try {
					if (currentTime > expirationTime) await removeFile(path.join(dirPath, file));
				} catch (error) {
					logger.error(err);
				}
			},
			{ concurrency: files.length },
		);
		return resolve();
	});
});

const init = async (params) => createDir(params.dirPath);

module.exports = {
	init,
	write,
	read,
	remove: removeFile,
	list,
	purge,
	existsFile,
	isFile,
	isFilePathInDirectory,
};
