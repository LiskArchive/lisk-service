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
const logger = require('lisk-service-framework').Logger();
const path = require('path');
const { dataDir } = require('../config');

const { deleteEmptyFoldersAndNonMetaFiles } = require('../shared/deleteNonMetaFiles');

module.exports = [
	{
		name: 'delete.non.metadata.files',
		description: 'Delete any non-metadata files and empty folders inside data directory',
		schedule: '* * * * *', // Every day at midnight
		controller: async () => {
			logger.debug('Cleaning data directory...');
			try {
				logger.info('Starting to clean data directory.');
				await deleteEmptyFoldersAndNonMetaFiles(dataDir);
				logger.info('Data directory has been successfully cleaned.');
			} catch (err) {
				logger.warn(`Cleaning data directory failed due to: ${err.message}.`);
			}
		},
	},
];
