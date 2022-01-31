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
} = require('lisk-service-framework');

const {
	exists,
	mkdir,
} = require('../../../fsUtils');

const config = require('../../../../config');
const {
	downloadAndExtractTarball,
} = require('../../../downloadFile');

const logger = Logger();

let snapshotUrl;
let snapshotFilePath;

const constantsCache = CacheRedis('networkConstants', config.endpoints.redis);

const downloadSnapshot = async () => {
	const directoryPath = path.dirname(snapshotFilePath);
	if (!(await exists(directoryPath))) await mkdir(directoryPath, { recursive: true });
	await downloadAndExtractTarball(snapshotUrl, directoryPath);
};

const checkCommandAvailability = async () => {
	const { stdout: mysqlAvailable } = await execInShell('which mysql');
	const { stdout: dockerComposeAvailable } = await execInShell('which docker-compose');
	if (!mysqlAvailable && !dockerComposeAvailable) throw new Error('Both mysql and docker-compose are unavailable in PATH');
};

const resolveSnapshotRestoreCommand = async (connEndpoint) => {
	await checkCommandAvailability();
	const composeFile = config.snapshot.composeFilePath;
	const dockerServiceName = config.snapshot.serviceName;

	const [user, password] = connEndpoint.split('//')[1].split('@')[0].split(':');
	const database = connEndpoint.split('@')[1].split('/')[1];
	const mysqlSnapshotCommand = `mysql ${database} -u ${user} -p${password} < ${snapshotFilePath}`;
	if (!composeFile && !dockerServiceName) return mysqlSnapshotCommand;

	if (composeFile) {
		if (!dockerServiceName) throw new Error('Docker service name required');
		return `docker-compose -f ${composeFile} exec -T ${dockerServiceName} ${mysqlSnapshotCommand}`;
	}
	throw new Error('Snapshot restore command cannot be resolved');
};

const applySnapshot = async (connEndpoint = config.endpoints.mysql) => {
	try {
		const snapshotRestoreCommand = await resolveSnapshotRestoreCommand(connEndpoint);
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
		await applySnapshot();
	}
};

module.exports = {
	initSnapshot,
	applySnapshot,
};
