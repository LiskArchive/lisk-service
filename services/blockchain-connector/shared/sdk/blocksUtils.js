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
const fs = require('fs');
const json = require('big-json');
const path = require('path');

const { Logger } = require('lisk-service-framework');

const { getNodeInfo } = require('./endpoints_1');
const { exists, mkdir, rmDir, extractTarBall } = require('../utils/fs');
const { downloadFile, verifyFileChecksum } = require('../utils/download');

const config = require('../../config');

const logger = Logger();

let readStream;
let genesisBlockUrl;
let genesisBlockFilePath;
let genesisBlock = { header: {} };

const parseStream = json.createParseStream();

const setGenesisBlock = (block) => genesisBlock = block;

const getGenesisBlock = () => genesisBlock;

const getGenesisBlockId = () => genesisBlock.header.id;

const loadConfig = async () => {
	const nodeInfo = await getNodeInfo();
	const { networkIdentifier } = nodeInfo;

	if (process.env.GENESIS_BLOCK_URL) {
		logger.info('Genesis block URL is defined by environment variable (GENESIS_BLOCK_URL)');

		genesisBlockUrl = config.genesisBlockUrl;
		logger.info(`genesisBlockUrl set to ${genesisBlockUrl}`);

		genesisBlockFilePath = `./data/${networkIdentifier}/genesis_block.json`;
		logger.info(`genesisBlockFilePath set to ${genesisBlockFilePath}`);
	} else {
		const [networkConfig] = config.networks.filter(c => networkIdentifier === c.identifier);
		if (networkConfig) {
			logger.info(`Found config for ${networkConfig.name} (${networkIdentifier})`);

			genesisBlockUrl = networkConfig.genesisBlockUrl;
			logger.info(`genesisBlockUrl set to ${genesisBlockUrl}`);

			genesisBlockFilePath = `./data/${networkIdentifier}/genesis_block.json`;
			logger.info(`genesisBlockFilePath set to ${genesisBlockFilePath}`);
		} else {
			logger.info(`Network is neither defined in the config, nor in the environment variable (${networkIdentifier})`);
			return;
		}
	}

	if (genesisBlockUrl) {
		// If file exists, already create a read stream
		if (await exists(genesisBlockFilePath)) {
			readStream = fs.createReadStream(genesisBlockFilePath);
		}
	}
};

// eslint-disable-next-line consistent-return
const downloadAndValidateGenesisBlock = async (retries = 2) => {
	const directoryPath = path.dirname(genesisBlockFilePath);
	const genesisFileName = genesisBlockUrl.substring(genesisBlockUrl.lastIndexOf('/') + 1);
	const genesisFilePath = `${directoryPath}/${genesisFileName}`;
	const checksumFilePath = `${genesisFilePath}.SHA256`;

	do {
		/* eslint-disable no-await-in-loop */
		try {
			if (!(await exists(directoryPath))) await mkdir(directoryPath, { recursive: true });

			// Download the genesis and the digest files
			const genesisBlockUrlSHA256 = genesisBlockUrl.concat('.SHA256');
			await downloadFile(genesisBlockUrl, directoryPath);
			await downloadFile(genesisBlockUrlSHA256, directoryPath);

			// Verify the integrity of the downloaded file, retry on failure
			const isValidGenesisBlock = await verifyFileChecksum(genesisFilePath, checksumFilePath);

			// Extract the file if necessary
			if (genesisFilePath.endsWith('.tar.gz')) {
				await extractTarBall(genesisFilePath, directoryPath);
			}

			if (isValidGenesisBlock) return true;

			// Delete all previous files including the containing directory
			await rmDir(directoryPath);
		} catch (err) {
			logger.error('Error while downloading and validating genesis block');
			logger.error(err.message);
		}
		/* eslint-enable no-await-in-loop */
	} while (retries-- > 0);

	logger.fatal(`Unable to verify the integrity of the downloaded genesis block from ${genesisBlockUrl}`);
	logger.fatal('Exiting the application');
	process.exit(1);
};

const getGenesisBlockFromFS = async () => {
	if (!genesisBlockUrl || !genesisBlockFilePath) await loadConfig();
	if (!getGenesisBlockId()) {
		if (!(await exists(genesisBlockFilePath))) {
			await downloadAndValidateGenesisBlock();
			readStream = fs.createReadStream(genesisBlockFilePath);
		}

		const block = await new Promise((resolve, reject) => {
			readStream.pipe(parseStream.on('data', (data) => resolve(data)));
			parseStream.on('error', (err) => reject(err));
		});

		if (!getGenesisBlockId()) setGenesisBlock(block);
	}

	return getGenesisBlock();
};

module.exports = {
	getGenesisBlockId,
	getGenesisBlockFromFS,
};
