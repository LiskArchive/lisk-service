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
const fs = require('fs');
const BluebirdPromise = require('bluebird');
const {
	Utils: {
		fs: { stats, mkdir, read, write, isFile, getFiles, fileExists, isFilePathInDirectory, rm },
	},
	Logger,
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const config = require('../../config');

const { getAddressFromParams } = require('./account');
const { getDaysInMilliseconds, standardizeIntervalFromParams } = require('./time');

const logger = Logger();

const list = (dirPath, count = 100, page = 0) =>
	new Promise((resolve, reject) => {
		fs.readdir(dirPath, (err, files) => {
			if (err) {
				logger.error(err);
				return reject(err);
			}
			return resolve(files.slice(page, page + count));
		});
	});

const purge = async (dirPath, days) => {
	if (days === undefined) throw new ValidationException('days cannot be undefined.');

	try {
		// Get the list of files in the directory using getFiles method
		const files = await getFiles(dirPath, { withFileTypes: true });

		// Calculate the expiration time for each file and remove if expired
		await BluebirdPromise.map(
			files,
			async filePath => {
				const stat = await stats(filePath);
				const currentTime = new Date().getTime();
				const expirationTime = new Date(stat.ctime).getTime() + getDaysInMilliseconds(days);

				try {
					if (currentTime > expirationTime) await rm(filePath);
				} catch (error) {
					logger.error(error);
				}
			},
			{ concurrency: files.length },
		);
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const init = async params => mkdir(params.dirPath);

const getPartialFilenameFromParams = async (params, day) => {
	const address = getAddressFromParams(params);
	const filename = `${address}_${day}.json`;
	return filename;
};

const getExcelFilenameFromParams = async (params, chainID) => {
	const address = getAddressFromParams(params);
	const [from, to] = (await standardizeIntervalFromParams(params)).split(':');

	const filename = `transactions_${chainID}_${address}_${from}_${to}.xlsx`;
	return filename;
};

const getExcelFileUrlFromParams = async (params, chainID) => {
	const filename = await getExcelFilenameFromParams(params, chainID);
	const url = `${config.excel.baseURL}?filename=${filename}`;
	return url;
};

module.exports = {
	init,
	write,
	read,
	remove: rm,
	list,
	purge,
	fileExists,
	isFile,
	isFilePathInDirectory,

	getPartialFilenameFromParams,
	getExcelFilenameFromParams,
	getExcelFileUrlFromParams,
};
