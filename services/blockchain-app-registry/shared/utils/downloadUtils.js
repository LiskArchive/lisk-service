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
const http = require('http');
const https = require('https');
const fs = require('fs');
const tar = require('tar');

const {
	Logger,
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const logger = Logger();

const getHTTPProtocolByURL = (url) => url.startsWith('https') ? https : http;

const downloadAndExtractTarball = (url, directoryPath) => new Promise((resolve, reject) => {
	if (!url || !directoryPath) {
		reject(new Error(`Invalid url or directoryPath. url: ${url} directoryPath:${directoryPath}`));
		return;
	}

	logger.info(`Downloading and extracting file from ${url} to ${directoryPath}.`);
	getHTTPProtocolByURL(url).get(url, (response) => {
		if (response.statusCode === 200) {
			response.pipe(tar.extract({ cwd: directoryPath }));
			response.on('error', async (err) => reject(new Error(err)));
			response.on('end', async () => {
				logger.info('File downloaded and extracted successfully.');
				setTimeout(resolve, 100); // Since the promise resolves earlier than expected
			});
		} else {
			const errMessage = `Download failed with HTTP status code: ${response.statusCode} (${response.statusMessage}).`;
			logger.error(errMessage);
			if (response.statusCode === 404) reject(new NotFoundException(errMessage));
			reject(new Error(errMessage));
		}
	});
});

const downloadFile = (url, filePath) => new Promise((resolve, reject) => {
	if (!url || !filePath) {
		reject(new Error(`Invalid url or directoryPath. url: ${url} filePath:${filePath}`));
		return;
	}

	getHTTPProtocolByURL(url).get(url, (response) => {
		if (response.statusCode === 200) {
			const writeStream = fs.createWriteStream(filePath);
			response.pipe(writeStream);
			response.on('error', async (err) => reject(new Error(err)));
			response.on('end', async () => {
				logger.info('File downloaded successfully');
				resolve();
			});
		} else {
			const errMessage = `Download failed with HTTP status code: ${response.statusCode} (${response.statusMessage})`;
			logger.error(errMessage);
			if (response.statusCode === 404) reject(new NotFoundException(errMessage));
			reject(new Error(errMessage));
		}
	});
});

module.exports = {
	downloadAndExtractTarball,
	downloadFile,
};
