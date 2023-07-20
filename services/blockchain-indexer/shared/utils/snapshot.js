/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const {
	Logger,
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const zlib = require('zlib');
const util = require('util');
const config = require('../../config');
const execInShell = util.promisify(require('child_process').exec);

const { mkdir, exists } = require('./fs');
const { requestConnector } = require('./request');

const logger = Logger();

let snapshotFilePath = './data/service-snapshot.sql';

const getHTTPProtocolByURL = (url) => url.startsWith('https') ? https : http;

const checkCommandAvailability = async () => {
	const { stdout: mysqlAvailable } = await execInShell('which mysql').catch(() => ({}));
	if (!mysqlAvailable) throw new NotFoundException('mysql command is unavailable in PATH');
};

function downloadAndUnzipFile(fileUrl, filePath) {
	return new Promise((resolve, reject) => {
		getHTTPProtocolByURL(fileUrl).get(fileUrl, (response) => {
			if (response.statusCode === 200) {
				const unzip = zlib.createUnzip();
				const writeFile = fs.createWriteStream(filePath);

				response.pipe(unzip).pipe(writeFile);

				response.on('error', (err) => {
					reject(new Error(err));
				});

				writeFile.on('finish', () => {
					resolve();
				});

				writeFile.on('error', (err) => {
					reject(new Error(err));
				});
			} else {
				const errMessage = `Download failed with HTTP status code: ${response.statusCode} (${response.statusMessage})`;
				console.error(errMessage);
				if (response.statusCode === 404) {
					reject(new Error(`NotFoundException: ${errMessage}`));
				} else {
					reject(new Error(errMessage));
				}
			}
		}).on('error', (err) => {
			reject(new Error(err));
		});
	});
}

const resolveSnapshotRestoreCommand = async (connEndpoint) => {
	await checkCommandAvailability();
	const [user, password] = connEndpoint.split('//')[1].split('@')[0].split(':');
	const [host, port, database] = connEndpoint.split('@')[1].split(new RegExp('/|:', 'g'));
	const mysqlSnapshotCommand = `mysql ${database} -h ${host} -P ${port} -u ${user} -p${password} < ${snapshotFilePath}`;
	return mysqlSnapshotCommand;
};

const applySnapshot = async (connEndpoint = config.endpoints.mysql) => {
	try {
		logger.debug('Attempting to resolve the snapshot command.');
		const snapshotRestoreCommand = await resolveSnapshotRestoreCommand(connEndpoint);
		logger.info(`Resolved snapshot command to: ${snapshotRestoreCommand}.`);
		logger.info(`Attempting to apply the snapshot file available at: ${snapshotFilePath}.`);
		const { stdout, stderr } = await execInShell(snapshotRestoreCommand);
		logger.info(stdout);
		logger.warn(stderr);
		logger.info('SQL file(s) imported successfully.');
	} catch (error) {
		logger.error(error.stack);
		throw error;
	}
};

const downloadSnapshot = async (snapshotUrl) => {
	const directoryPath = path.dirname(snapshotFilePath);
	if (!(await exists(directoryPath))) await mkdir(directoryPath, { recursive: true });
	logger.info('Attempting to download the snapshot file.');
	await downloadAndUnzipFile(snapshotUrl, snapshotFilePath);
};

const initSnapshot = async () => {
	if (config.snapshot.enable !== true) {
		logger.info('Index snapshot application has been disabled.');
		return;
	}

	const { chainID } = await requestConnector('getNetworkStatus');
	const network = config.networks.LISK
		.filter(networkInfo => networkInfo.chainID === chainID)[0];

	snapshotFilePath = `./data/${network.name}/service-core-snapshot.sql`;
	let { snapshotUrl } = network;

	if (config.snapshot.url) {
		// Override if custom snapshot URL is specified
		snapshotUrl = config.snapshot.url;
	} else if (!snapshotUrl) {
		logger.warn(`Cannot apply snapshot. Snapshot URL for network (${network.name}) is unavailable.\nTry updating the config file or setting the 'INDEX_SNAPSHOT_URL' environment variable.`);
		return;
	}

	if (!snapshotUrl.startsWith('https') && !config.snapshot.allowInsecureHttp) {
		throw new Error(`Please consider using a secured source (HTTPS). To continue to download snapshot from ${snapshotUrl}, set 'ENABLE_SNAPSHOT_ALLOW_INSECURE_HTTP' env variable.`);
	}

	if (!(await exists(snapshotFilePath))) await downloadSnapshot(snapshotUrl);
	await applySnapshot();
};

module.exports = {
	initSnapshot,
	applySnapshot,
};
