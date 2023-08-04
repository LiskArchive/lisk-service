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
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const zlib = require('zlib');
const util = require('util');
const crypto = require('crypto');
const {
	Utils: {
		fs: { mkdir, exists },
	},
	Logger,
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');
const config = require('../../config');
const execInShell = util.promisify(require('child_process').exec);
const { requestConnector } = require('./request');
const regex = require('./regex');

const logger = Logger();

let snapshotFilePath = './data/service-snapshot.sql';
const MYSQL_ENDPOINT = config.endpoints.mysql;

const getHTTPProtocolByURL = (url) => url.startsWith('https') ? https : http;

const checkCommandAvailability = async () => {
	const { stdout: mysqlAvailable } = await execInShell('which mysql').catch(() => ({}));
	if (!mysqlAvailable) throw new NotFoundException('mysql command is unavailable in PATH.');
};

const calculateSHA256 = async (file) => new Promise((resolve, reject) => {
	const hash = crypto.createHash('sha256');
	const stream = fs.createReadStream(file);

	stream.on('data', (data) => hash.update(data));
	stream.on('end', () => resolve(hash.digest('hex')));
	stream.on('error', (error) => reject(error));
});

// Check if the IP address is local/private
const isLocalIP = (ip) => ip === '127.0.0.1' || regex.PRIVATE_IP_REGEX.test(ip);

const validateSnapshotURL = async (snapshotURL) => {
	const { hostname } = new URL(snapshotURL);

	// Check if the hostname is a local/private IP address or localhost
	if (isLocalIP(hostname) || hostname === 'localhost') {
		throw new Error('Request to local/private IP addresses or localhost is not allowed.');
	}

	return new Promise((resolve, reject) => {
		// Preflight HEAD request to check content type
		logger.info('Performing preflight HEAD request to check content type.');
		const options = {
			method: 'HEAD',
		};

		getHTTPProtocolByURL(snapshotURL).request(snapshotURL, options, (res) => {
			if (res.statusCode === 200 && res.headers['content-type'] === 'application/octet-stream') {
				logger.info('Content type is valid. Downloading the snapshot file.');
				resolve();
			} else {
				reject(new Error(`Invalid content type or download failed when using snapshot URL: ${snapshotURL}.`));
			}
		}).on('error', (err) => {
			reject(err);
		}).end();
	});
};

const downloadUnzipAndVerifyChecksum = async (fileUrl, checksumUrl, filePath) => {
	await validateSnapshotURL(fileUrl);

	return new Promise((resolve, reject) => {
		// Download the checksum file
		logger.info('Attempting to download the snapshot checksum.');
		getHTTPProtocolByURL(checksumUrl).get(checksumUrl, (response) => {
			if (response.statusCode === 200) {
				let checksumData = '';

				response.on('data', (chunk) => {
					checksumData += chunk;
				});

				response.on('end', () => {
					// Extract the SHA256 hash from the downloaded data
					const checksum = checksumData.trim().split(' ')[0];

					// Download and unzip the file
					logger.info('Attempting to download the snapshot file.');
					getHTTPProtocolByURL(fileUrl).get(fileUrl, (res) => {
						if (res.statusCode === 200) {
							const unzip = zlib.createUnzip();
							const writeFile = fs.createWriteStream(filePath);

							res.pipe(unzip).pipe(writeFile);

							res.on('error', (err) => {
								reject(new Error(err));
							});

							writeFile.on('finish', () => {
								// calculate hash from file.
								calculateSHA256(filePath).then((calculatedChecksum) => {
									if (calculatedChecksum === checksum) {
										resolve();
									} else {
										reject(new Error('Checksum verification failed.'));
									}
								}).catch(err => {
									reject(err);
								});
							});

							writeFile.on('error', (err) => {
								reject(err);
							});
						} else {
							const errMessage = `Download failed with HTTP status code: ${res.statusCode} (${res.statusMessage}).`;
							console.error(errMessage);
							if (res.statusCode === 404) {
								reject(new NotFoundException(errMessage));
							} else {
								reject(new Error(errMessage));
							}
						}
					}).on('error', (err) => {
						reject(new Error(err));
					});
				});
			} else {
				logger.error(`Failed to download the checksum file. HTTP status code: ${response.statusCode} (${response.statusMessage}).`);
				reject(new Error('Failed to download the checksum file.'));
			}
		}).on('error', (err) => {
			reject(new Error(err));
		});
	});
};

const resolveSnapshotRestoreCommand = async (connEndpoint) => {
	await checkCommandAvailability();
	const [user, password] = connEndpoint.split('//')[1].split('@')[0].split(':');
	const [host, port, database] = connEndpoint.split('@')[1].split(new RegExp('/|:', 'g'));
	const mysqlSnapshotCommand = `mysql ${database} -h ${host} -P ${port} -u ${user} -p${password} < ${snapshotFilePath}`;
	return mysqlSnapshotCommand;
};

const applySnapshot = async (connEndpoint = MYSQL_ENDPOINT) => {
	try {
		logger.debug('Attempting to resolve the snapshot command.');
		const snapshotRestoreCommand = await resolveSnapshotRestoreCommand(connEndpoint);
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

	const expectedChecksumURL = snapshotUrl.replace('.gz', '.SHA256');
	await downloadUnzipAndVerifyChecksum(snapshotUrl, expectedChecksumURL, snapshotFilePath);
};

const initSnapshot = async () => {
	if (config.snapshot.enable !== true) {
		logger.info('Index snapshot application has been disabled.');
		return;
	}

	const { chainID } = await requestConnector('getNetworkStatus');
	const network = config.networks.LISK
		.find(networkInfo => networkInfo.chainID === chainID);

	snapshotFilePath = `./data/${network.name}/service-snapshot.sql`;
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

	await downloadSnapshot(snapshotUrl);
	await applySnapshot();
};

module.exports = {
	initSnapshot,
	applySnapshot,
};
