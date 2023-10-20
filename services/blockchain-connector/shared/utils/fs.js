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
const tar = require('tar');

const {
	Utils: {
		fs: { mkdir, exists, read, rm },
	},
	Logger,
} = require('lisk-service-framework');

const logger = Logger();

const extractTarBall = async (filePath, directoryPath) =>
	new Promise((resolve, reject) => {
		const fileStream = fs.createReadStream(filePath);
		fileStream.pipe(tar.extract({ cwd: directoryPath }));
		fileStream.on('error', async err => reject(new Error(err)));
		fileStream.on('end', async () => {
			logger.debug('File extracted successfully.');
			resolve();
		});
	});

module.exports = {
	exists,
	extractTarBall,
	mkdir,
	read,
	rm,
};
