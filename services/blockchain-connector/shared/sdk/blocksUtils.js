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
const path = require('path');
const json = require('big-json');

const {
	Logger,
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const { getNodeInfo } = require('./endpoints_1');
const { formatBlock } = require('./formatter');
const { exists, mkdir, rm, extractTarBall } = require('../utils/fs');
const { downloadFile, verifyFileChecksum } = require('../utils/download');

const config = require('../../config');

const logger = Logger();

let readStream;
let genesisBlockUrl;
let genesisBlockFilePath;
let genesisBlock = { header: {} };

let isGenesisBlockURLNotFound = false;

const parseStream = json.createParseStream();

const setGenesisBlock = block => (genesisBlock = block);

const getGenesisBlock = () => genesisBlock;

const getGenesisBlockId = () => genesisBlock.header.id;

const loadConfig = async () => {
	const nodeInfo = await getNodeInfo();
	const { chainID } = nodeInfo;

	if (config.genesisBlockUrl !== config.constants.GENESIS_BLOCK_URL_DEFAULT) {
		genesisBlockUrl = config.genesisBlockUrl;
		logger.info(`genesisBlockUrl set to ${genesisBlockUrl}`);

		genesisBlockFilePath = `./data/${chainID}/genesis_block.json`;
		logger.info(`genesisBlockFilePath set to ${genesisBlockFilePath}`);
	} else {
		// Check if current node is running Lisk Core
		const [networkConfig] = config.networks.LISK.filter(c => chainID === c.chainID);
		if (networkConfig) {
			logger.info(`Found config for ${networkConfig.name} (${chainID})`);

			genesisBlockUrl = networkConfig.genesisBlockUrl;
			logger.info(`genesisBlockUrl set to ${genesisBlockUrl}`);

			genesisBlockFilePath = `./data/${chainID}/genesis_block.json`;
			logger.info(`genesisBlockFilePath set to ${genesisBlockFilePath}`);
		} else {
			logger.info(
				`Network is neither defined in the config, nor in the environment variable (${chainID})`,
			);
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
		try {
			if (!(await exists(directoryPath))) await mkdir(directoryPath, { recursive: true });

			// Download the genesis and the digest files
			const genesisBlockUrlSHA256 = genesisBlockUrl.concat('.SHA256');
			await downloadFile(genesisBlockUrl, directoryPath);
			await downloadFile(genesisBlockUrlSHA256, directoryPath);

			// Verify the integrity of the downloaded file, retry on failure
			const isValidGenesisBlock = await verifyFileChecksum(genesisFilePath, checksumFilePath);

			if (isValidGenesisBlock) {
				// Extract if downloaded file is a tar archive
				if (genesisFilePath.endsWith('.tar.gz'))
					await extractTarBall(genesisFilePath, directoryPath);

				return true;
			}

			// Delete all previous files including the containing directory if genesis block is not valid
			await rm(directoryPath, { recursive: true, force: true });
		} catch (err) {
			logger.error('Error while downloading and validating genesis block.');
			logger.error(err.message);
			if (err instanceof NotFoundException) {
				isGenesisBlockURLNotFound = true;
				throw err;
			}
		}
	} while (retries-- > 0);

	logger.fatal(
		`Unable to verify the integrity of the downloaded genesis block from ${genesisBlockUrl}.`,
	);
	logger.fatal('Exiting the application.');
	process.exit(1);
};

const getGenesisBlockFromFS = async () => {
	if (isGenesisBlockURLNotFound) throw new NotFoundException();

	if (!genesisBlockUrl || !genesisBlockFilePath) await loadConfig();
	if (!getGenesisBlockId()) {
		if (!(await exists(genesisBlockFilePath))) {
			await downloadAndValidateGenesisBlock();
			readStream = fs.createReadStream(genesisBlockFilePath);
		}

		const block = await new Promise((resolve, reject) => {
			readStream.pipe(parseStream.on('data', data => resolve(data)));
			parseStream.on('error', err => reject(err));
		});

		const formattedBlock = await formatBlock(block);
		if (!getGenesisBlockId()) setGenesisBlock(formattedBlock);
	}

	return getGenesisBlock();
};

module.exports = {
	getGenesisBlockId,
	getGenesisBlockFromFS,
};
