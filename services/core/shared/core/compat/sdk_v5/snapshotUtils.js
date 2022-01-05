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
const path = require('path');
const tar = require('tar');
const Importer = require('mysql-import');

const {
	CacheRedis,
	Logger,
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const {
	exists,
	mkdir,
} = require('../../../fsUtils');

const config = require('../../../../config');

const logger = Logger();

let readStream;
let snapshotUrl;
let snapshotFilePath;

const constantsCache = CacheRedis('networkConstants', config.endpoints.redis);

// const parseStream = json.createParseStream();

const downloadSnapshot = async () => {
	const directoryPath = path.dirname(snapshotFilePath);
	if (!(await exists(directoryPath))) await mkdir(directoryPath, { recursive: true });

	return new Promise((resolve, reject) => {
		https.get(snapshotUrl, (response) => {
			if (response.statusCode === 200) {
				response.pipe(tar.extract({ cwd: directoryPath }));
				response.on('error', async (err) => reject(err));
				response.on('end', async () => {
					logger.info('Snapshot downloaded successfully');
					return setTimeout(resolve, 500);
				});
			} else {
				const errMessage = `Download failed with HTTP status code: ${response.statusCode} (${response.statusMessage})`;
				logger.error(errMessage);
				if (response.statusCode === 404) throw new NotFoundException(errMessage);
				throw new Error(errMessage);
			}
		});
	});
};

const applySnapshot = async (connEndpoint = config.endpoints.mysql) => {
	const [userName, password] = connEndpoint.split('//')[1].split('@')[0].split(':');
	const [hostPort, dbName] = connEndpoint.split('@')[1].split('/');
	const importer = new Importer({ hostPort, userName, password, dbName });

	importer.import(snapshotFilePath).then(() => {
		const filesImported = importer.getImported();
		logger.info(`${filesImported.length} SQL file(s) imported.`);
	}).catch(err => {
		logger.error(err);
	});
};

const initSnapshot = async () => {
	if (config.snapshot.enable === false) {
		logger.info('Index snapshot application has been disabled');
		return;
	}

	const { data: { networkIdentifier } } = JSON.parse(await constantsCache.get('networkConstants'));

	const [networkConfig] = config.networks.filter(c => networkIdentifier === c.identifier);
	if (networkConfig) {
		snapshotUrl = networkConfig.snapshotUrl;
		snapshotFilePath = `./data/${networkIdentifier}/service-core-snapshot.sql`;
	} else {
		logger.info(`Network is neither defined in the config, nor in the environment variable (${networkIdentifier})`);
		return;
	}

	if (!(await exists(snapshotFilePath))) {
		await downloadSnapshot();
		readStream = fs.createReadStream(snapshotFilePath);
	}
	await applySnapshot();
};

module.exports = {
	initSnapshot,
};
