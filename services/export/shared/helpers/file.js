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
	Logger,
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const {
	getDaysInMilliseconds,
} = require('./time');

const logger = Logger();

const getFileStats = filePath => new Promise((resolve, reject) => {
	fs.stat(filePath, (err, stat) => {
		if (err) {
			logger.error(err);
			return reject(err);
		}
		return resolve(stat);
	});
});

const createDir = (dirPath, options = { recursive: true }) => new Promise((resolve, reject) => {
	logger.debug(`Creating directory: ${dirPath}`);
	return fs.mkdir(
		dirPath,
		options,
		(err) => {
			if (err) {
				logger.error(`Error when creating directory: ${dirPath}\n`, err.message);
				return reject(err);
			}
			logger.debug(`Successfully created directory: ${dirPath}`);
			return resolve();
		},
	);
});

const init = async (params) => createDir(params.dirPath);

const write = (filePath, content) => new Promise((resolve, reject) => {
	fs.writeFile(filePath, content, (err) => {
		if (err) {
			logger.error(err);
			return reject(err);
		}
		return resolve();
	});
});

const read = (filePath) => new Promise((resolve, reject) => {
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			logger.error(err);
			return reject(err);
		}
		return resolve(data);
	});
});

const remove = (filePath) => new Promise((resolve, reject) => {
	fs.unlink(
		filePath,
		(err) => {
			if (err) {
				logger.error(err);
				return reject(err);
			}
			return resolve();
		},
	);
});

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
				const stat = await getFileStats(path.join(dirPath, file));
				const currentTime = new Date().getTime();
				const expirationTime = new Date(stat.ctime).getTime() + getDaysInMilliseconds(days);
				try {
					if (currentTime > expirationTime) await remove(path.join(dirPath, file));
				} catch (error) {
					logger.error(err);
				}
			},
			{ concurrency: files.length },
		);
		return resolve();
	});
});

const exists = async filePath => !!(await fs.promises.stat(filePath).catch(() => null));

module.exports = {
	init,
	write,
	read,
	remove,
	list,
	purge,
	exists,
};
