/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const {
	Microservice,
	Logger,
	LoggerConfig,
} = require('lisk-service-framework');

const config = require('./config');
const packageJson = require('./package.json');

const nodeStatus = require('./shared/nodeStatus');

const snapshotUtils = require('./shared/core/compat/sdk_v5/snapshotUtils');

const loggerConf = {
	...config.log,
	name: packageJson.name,
	version: packageJson.version,
};

LoggerConfig(loggerConf);

const logger = Logger();

const app = Microservice({
	name: 'core',
	transporter: config.transporter,
	brokerTimeout: config.brokerTimeout, // in seconds
	logger: loggerConf,
});

nodeStatus.waitForNode().then(async () => {
	logger.info('Found a node, initiating Lisk Core...');

	// TODO: Remove after logging issues with 'sdk_v5/snapshotUtils.js' are resolved
	if (config.snapshot.enable) logger.info('Initialising the automatic index snapshot application process');
	await snapshotUtils.initSnapshot()
		.then(() => { if (config.snapshot.enable) logger.info('Successfully downloaded and applied the snapshot'); })
		.catch(err => logger.warn(`Unable to apply snapshot:\n${err.message}`));

	// Ensure all the tables are created in the database
	const blockchainStore = require('./shared/core/compat/sdk_v5/blockchainIndex');
	await blockchainStore.initializeSearchIndex();

	logger.info('Checking for node sync status');
	const intervalID = setInterval(
		() => logger.info('Node synchronization still in progress...'),
		nodeStatus.CORE_SYNC_CHECK_INTERVAL,
	);

	nodeStatus.waitForNodeToFinishSync().then(async () => {
		clearInterval(intervalID);
		logger.info('Node synchronization is complete');

		app.addMethods(path.join(__dirname, 'methods', 'api_v2'));
		app.addEvents(path.join(__dirname, 'events'));
		app.addJobs(path.join(__dirname, 'jobs'));

		app.run().then(() => {
			logger.info(`Service started ${packageJson.name}`);
			logger.info('Triggering the init process');
			const coreApi = require('./shared/core');
			coreApi.init();
		}).catch(err => {
			logger.fatal(`Could not start the service ${packageJson.name} + ${err.message}`);
			logger.fatal(err.stack);
			process.exit(1);
		});
	});
});
