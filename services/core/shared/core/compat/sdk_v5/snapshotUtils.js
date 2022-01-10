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
const path = require('path');
const Importer = require('mysql-import');

const {
	CacheRedis,
	Logger,
} = require('lisk-service-framework');

const {
	exists,
	mkdir,
} = require('../../../fsUtils');

const config = require('../../../../config');
const {
	downloadZip,
} = require('../../../downloadFile');

const logger = Logger();

let snapshotUrl;
let snapshotFilePath;

const constantsCache = CacheRedis('networkConstants', config.endpoints.redis);

const downloadSnapshot = async () => {
	const directoryPath = path.dirname(snapshotFilePath);
	if (!(await exists(directoryPath))) await mkdir(directoryPath, { recursive: true });
	await downloadZip(snapshotUrl, directoryPath);
};

const applySnapshot = async (connEndpoint = config.endpoints.mysql) => {
	const [user, password] = connEndpoint.split('//')[1].split('@')[0].split(':');
	const [hostPort, database] = connEndpoint.split('@')[1].split('/');
	const host = hostPort.split(':')[0];
	const importer = new Importer({ host, user, password, database });

	importer.onProgress(progress => {
		const importProgress = Math
			.floor(progress.bytes_processed / progress.total_bytes * 10000) / 100;
		logger.info(`${importProgress}% Completed`);
	});

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

	const [networkConfig] = config.netxworks.filter(c => networkIdentifier === c.identifier);
	if (networkConfig) {
		snapshotUrl = networkConfig.snapshotUrl;
		snapshotFilePath = `./data/${networkIdentifier}/service-core-snapshot.sql`;
	} else {
		logger.info(`Network is neither defined in the config, nor in the environment variable (${networkIdentifier})`);
		return;
	}

	if (!(await exists(snapshotFilePath))) {
		await downloadSnapshot();
	}
	await applySnapshot();
};

module.exports = {
	initSnapshot,
};
