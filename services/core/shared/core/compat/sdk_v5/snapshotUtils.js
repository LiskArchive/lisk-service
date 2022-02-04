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
const util = require('util');
const execInShell = util.promisify(require('child_process').exec);

const {
	CacheRedis,
	Logger,
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const {
	getNetworkConstants,
} = require('../common/constants');

const {
	exists,
	mkdir,
} = require('../../../fsUtils');

const config = require('../../../../config');
const {
	downloadAndUnzipFile,
} = require('../../../downloadFile');

const logger = Logger();

let snapshotUrl;
let snapshotFilePath;

const constantsCache = CacheRedis('networkConstants', config.endpoints.redis);

const downloadSnapshot = async () => {
	const directoryPath = path.dirname(snapshotFilePath);
	if (!(await exists(directoryPath))) await mkdir(directoryPath, { recursive: true });
	await downloadAndUnzipFile(snapshotUrl, snapshotFilePath);
};

const checkCommandAvailability = async () => {
	const { stdout: mysqlAvailable } = await execInShell('which mysql').catch(() => ({}));
	const { stdout: dockerComposeAvailable } = await execInShell('which docker-compose').catch(() => ({}));
	if (!mysqlAvailable && !dockerComposeAvailable) throw new NotFoundException('Both mysql and docker-compose are unavailable in PATH');
};

const resolveSnapshotRestoreCommand = async (connEndpoint) => {
	await checkCommandAvailability();
	const composeFile = config.snapshot.composeFilePath;
	const dockerServiceName = config.snapshot.serviceName;

	const [user, password] = connEndpoint.split('//')[1].split('@')[0].split(':');
	const [host, port, database] = connEndpoint.split('@')[1].split(new RegExp('/|:', 'g'));
	const mysqlSnapshotCommand = `mysql ${database} -h ${host} -P ${port} -u ${user} -p${password} < ${snapshotFilePath}`;
	if (!composeFile && !dockerServiceName) return mysqlSnapshotCommand;

	if (composeFile) {
		if (!dockerServiceName) throw new Error('Docker service name required');
		return `docker-compose -f ${composeFile} exec -T ${dockerServiceName} ${mysqlSnapshotCommand}`;
	}
	throw new Error('Snapshot restore command cannot be resolved');
};

const applySnapshot = async (connEndpoint = config.endpoints.mysql) => {
	try {
		logger.debug('Attempting to resolve the snapshot command');
		const snapshotRestoreCommand = await resolveSnapshotRestoreCommand(connEndpoint);
		logger.debug(`Resolved snapshot command to: ${snapshotRestoreCommand}`);
		logger.info('Attempting to apply snapshot');
		const { stdout, stderr } = await execInShell(snapshotRestoreCommand);
		logger.info(stdout);
		logger.warn(stderr);
		logger.info('SQL file(s) imported successfully');
	} catch (error) {
		logger.error(error);
		throw error;
	}
};

const initSnapshot = async () => {
	if (config.snapshot.enable !== true) {
		logger.info('Index snapshot application has been disabled');
		return;
	}

	const cachedNetworkConstants = await constantsCache.get('networkConstants');
	const {
		data: { networkIdentifier },
	} = cachedNetworkConstants ? JSON.parse(cachedNetworkConstants) : await getNetworkConstants();

	snapshotFilePath = `./data/${networkIdentifier}/service-core-snapshot.sql`;
	const [networkConfig] = config.networks.filter(c => networkIdentifier === c.identifier);
	if (networkConfig) snapshotUrl = networkConfig.snapshotUrl;

	if (config.snapshot.url) {
		// Override if custom snapshot URL is specified
		snapshotUrl = config.snapshot.url;
	} else if (!snapshotUrl) {
		logger.info(`Cannot apply snapshot. Snapshot URL for network (${networkIdentifier}) is unavailable.\nTry updating the config file or setting the 'INDEX_SNAPSHOT_URL' environment variable`);
		return;
	}

	if (!(await exists(snapshotFilePath))) await downloadSnapshot();
	await applySnapshot();
	logger.info('Successfully downloaded and applied the snapshot');
};

module.exports = {
	initSnapshot,
	applySnapshot,
};
