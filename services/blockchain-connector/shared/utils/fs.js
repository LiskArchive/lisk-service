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
const util = require('util');
const crypto = require('crypto');
const tar = require('tar');

const { Logger } = require('lisk-service-framework');

const logger = Logger();

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

const verifyChecksum = async (filePath, expectedChecksum) => {
	const fileStream = fs.createReadStream(filePath);
	const dataHash = crypto.createHash('sha256');
	const fileHash = await new Promise((resolve, reject) => {
		fileStream.on('data', (datum) => {
			dataHash.update(datum);
		});
		fileStream.on('error', error => {
			reject(error);
		});
		fileStream.on('end', () => {
			resolve(dataHash.digest());
		});
	});

	const fileChecksum = fileHash.toString('hex');
	if (fileChecksum !== expectedChecksum) {
		logger.info(`Checksum verification failed for file:${filePath}\nExpected: ${expectedChecksum}, Actual: ${fileChecksum}`);
		return false;
	}

	return true;
};

const read = async (filePath) => {
	const readWrapper = util.promisify(fs.readFile);

	return readWrapper(filePath, 'utf8');
};

const remove = async (filePath) => {
	if (await exists(filePath)) {
		const rmWrapper = util.promisify(fs.rm);

		await rmWrapper(filePath, { recursive: true, force: true });
	}
};

const verifyFileChecksum = async (filePath, checksumPath) => {
	const expectedChecksum = (await read(checksumPath)).split(' ')[0];

	return verifyChecksum(filePath, expectedChecksum);
};

const extractTarBall = async (filePath, directoryPath) => fs
	.createReadStream(filePath)
	.pipe(tar.extract({ cwd: directoryPath }));

module.exports = {
	remove,
	exists,
	extractTarBall,
	mkdir,
	verifyFileChecksum,
};
