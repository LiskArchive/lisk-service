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

const deleteFolderIfEmpty = async (folderPath) => {
	const files = await getFilesAndDirs(folderPath);

	if (files.length === 0) {
		await rmdir(folderPath);
		logger.trace(`Deleted folder: ${folderPath}.`);
	}
};

const deleteEmptyFoldersAndNonMetaFiles = async (folderPath) => {
	const filesAndDirPaths = await getFilesAndDirs(folderPath);

	for (let i = 0; i < filesAndDirPaths.length; i++) {
		/* eslint-disable no-await-in-loop */
		const filePath = filesAndDirPaths[i];
		const isDirectory = (await stats(filePath)).isDirectory();

		if (isDirectory) {
			await deleteEmptyFoldersAndNonMetaFiles(filePath);
			await deleteFolderIfEmpty(filePath);
		} else if (!ALLOWED_FILE_EXTENSIONS.some((ending) => filePath.endsWith(ending))
					&& !isMetadataFile(filePath)) {
			await rm(filePath);
			logger.trace(`Deleted file: ${filePath}.`);
		}
		/* eslint-enable no-await-in-loop */
	}
};

module.exports = [
	{
		name: 'delete.non.metadata.files',
		description: 'Delete any non-metadata files and empty folders inside data directory',
		schedule: '0 0 * * *', // Every day at midnight
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