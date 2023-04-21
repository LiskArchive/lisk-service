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
const { dataDir, ALLOWED_FILE_EXTENSIONS } = require('../config');
const { getFilesAndDirs, rmdir, rm, stats } = require('../shared/utils/fsUtils');
const { isMetadataFile } = require('../shared/utils/downloadRepository');

const removeDirectoryIfEmpty = async (dirPath) => {
	const files = await getFilesAndDirs(dirPath);

	if (files.length === 0) {
		await rmdir(dirPath);
		logger.trace(`Removed directory: ${dirPath}.`);
	}
};

const removeEmptyDirectoriesAndNonMetaFiles = async (dirPath) => {
	const contents = await getFilesAndDirs(dirPath);

	for (let i = 0; i < contents.length; i++) {
		/* eslint-disable no-await-in-loop */
		const filePath = contents[i];
		const isDirectory = (await stats(filePath)).isDirectory();

		if (isDirectory) {
			await removeEmptyDirectoriesAndNonMetaFiles(filePath);
			await removeDirectoryIfEmpty(filePath);
		} else if (!ALLOWED_FILE_EXTENSIONS.some((ending) => filePath.endsWith(ending))
					&& !isMetadataFile(filePath)) {
			await rm(filePath);
			logger.trace(`Removed file: ${filePath}.`);
		}
		/* eslint-enable no-await-in-loop */
	}
};

module.exports = [
	{
		name: 'delete.non.metadata.files',
		description: 'Delete any non-metadata files and empty folders inside data directory.',
		schedule: '0 0 * * *', // Every day at midnight
		controller: async () => {
			logger.debug('Cleaning data directory...');
			try {
				logger.info('Starting to clean data directory.');
				await removeEmptyDirectoriesAndNonMetaFiles(dataDir);
				logger.info('Data directory has been successfully cleaned.');
			} catch (err) {
				logger.warn(`Cleaning data directory failed due to: ${err.message}.`);
			}
		},
	},
];
