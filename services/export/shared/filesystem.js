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
const path = require('path');
const fs = require('fs');
const { Logger } = require('lisk-service-framework');

const logger = Logger();

const createDir = async (dirPath, options = { recursive: true }) => {
	logger.debug(`Creating directory: ${dirPath}`);
	await fs.mkdir(
		dirPath,
		options,
		(err) => {
			if (err) logger.error(`Error when creating directory: ${dirPath}\n`, err.message);
			else logger.debug(`Successfully created directory: ${dirPath}`);
		},
	);
};

const init = (params) => createDir(params.dirPath);

const write = async (filename, content) => new Promise((resolve, reject) => {
	fs.writeFile(`${path.dirname(__dirname)}/data/${filename}`, JSON.stringify(content), (err) => {
		if (err) {
			console.error(err);
			return reject(err);
		}
		return resolve();
	});
});

const read = async (filename) => new Promise((resolve, reject) => {
	fs.readFile(`${path.dirname(__dirname)}/data/${filename}`, (err, data) => {
		if (err) {
			logger.error(err);
			return reject(err);
		}
		return resolve(JSON.parse(data));
	});
});

const remove = async (filename) => {
	fs.unlink(`${path.dirname(__dirname)}/data/${filename}`, (err) => {
		if (err) logger.error(err);
	});
};

const list = async (filePath, n = 100, page = 0) => {
	fs.readdir(`${path.dirname(__dirname)}/data/${filePath}`, (err, files) => files.slice(page, page + n));
};

const purge = async (dirName, days = 1) => {
	fs.readdir(dirName, (_, files) => {
		files.forEach((file) => {
			fs.stat(path.join(dirName, file), (err, stat) => {
				if (err) logger.error(err);
				const now = new Date().getTime();
				const endTime = new Date(stat.ctime).getTime() + (days * 24 * 60 * 60 * 1000);
				if (now > endTime) {
					fs.unlink(path.join(dirName, file), (error) => {
						if (error) logger.error(error);
					});
				}
			});
		});
	});
};

module.exports = {
	init,
	write,
	read,
	remove,
	list,
	purge,
};
