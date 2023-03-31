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
const logger = require('lisk-service-framework').Logger();
const path = require('path');

const { deleteEmptyFoldersAndNonMetaFiles } = require('../shared/utils/fsUtils');

module.exports = [
	{
		name: 'job.clean.data',
		description: 'Delete any non-metadata files and empty folders inside data directory',
		schedule: '0 0 * * *', // Every day at midnight
		controller: () => {
			logger.debug('Cleaning data directory...');
			try {
				logger.info('Starting to clean data directory.');
				deleteEmptyFoldersAndNonMetaFiles(path.resolve('./data'));
				logger.info('Data directory has been successfully cleaned.');
			} catch (err) {
				logger.warn(`Cleaning data directory failed due to: ${err.message}`);
			}
		},
	},
];
