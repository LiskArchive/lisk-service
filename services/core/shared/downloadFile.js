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
const https = require('https');
const tar = require('tar');

const {
	Logger,
	Exceptions: { NotFoundException },
	HTTP: { request },
} = require('lisk-service-framework');

const logger = Logger();

const downloadAndExtractTarball = (url, directoryPath) => new Promise((resolve, reject) => {
	https.get(url, (response) => {
		if (response.statusCode === 200) {
			response.pipe(tar.extract({ cwd: directoryPath }));
			response.on('error', async (err) => reject(err));
			response.on('end', async () => {
				logger.info('File downloaded successfully');
				return resolve();
			});
		} else {
			const errMessage = `Download failed with HTTP status code: ${response.statusCode} (${response.statusMessage})`;
			logger.error(errMessage);
			if (response.statusCode === 404) return reject(new NotFoundException(errMessage));
			return reject(new Error(errMessage));
		}
	});
});

const downloadJSONFile = (fileUrl, filePath) => new Promise((resolve, reject) => {
	request(fileUrl)
		.then(async response => {
			const block = typeof response === 'string' ? JSON.parse(response).data : response.data;
			fs.writeFile(filePath, JSON.stringify(block), () => {
				logger.info('File downloaded successfully');
				return resolve();
			});
		})
		.catch(err => reject(err));
});

module.exports = {
	downloadAndExtractTarball,
	downloadJSONFile,
};
