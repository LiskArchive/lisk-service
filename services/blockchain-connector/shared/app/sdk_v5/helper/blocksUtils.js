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

const { getNodeInfo } = require('../actions_1');
const { exists, mkdir } = require('../../../utils/fsUtils');
const { downloadAndExtractTarball, downloadJSONFile } = require('../../../utils/downloadFile');

const config = require('../../../../config');

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

const downloadGenesisBlock = async () => {
	const directoryPath = path.dirname(genesisBlockFilePath);
	if (!(await exists(directoryPath))) await mkdir(directoryPath, { recursive: true });

	logger.info(`Downloading genesis block to the filesystem from: ${genesisBlockUrl}`);

	if (genesisBlockUrl.endsWith('.tar.gz')) await downloadAndExtractTarball(genesisBlockUrl, directoryPath);
	else await downloadJSONFile(genesisBlockUrl, genesisBlockFilePath);
};

const getGenesisBlockFromFS = async () => {
	if (!genesisBlockUrl || !genesisBlockFilePath) await loadConfig();
	if (!getGenesisBlockId()) {
		if (!(await exists(genesisBlockFilePath))) {
			await downloadGenesisBlock();
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
