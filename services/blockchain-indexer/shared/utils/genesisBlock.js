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
const {
	Logger,
} = require('lisk-service-framework');

const { codec } = require('@liskhq/lisk-codec');

const BluebirdPromise = require('bluebird');

const fs = require('fs');
const json = require('big-json');
const path = require('path');

const Bluebird = require('bluebird');
const { exists, mkdir, extractTarBall, rm } = require('./file');
const {
	getGenesisBlockUrl,
	getChainID,
	getBlockAssetDataSchemaByModule,
} = require('../constants');
const { downloadFile, verifyFileChecksum } = require('./download');
const { parseToJSONCompatObj } = require('./parser');

let genesisBlock = { header: {} };

const logger = Logger();
const parseStream = json.createParseStream();
let _genesisBlockFilePath;

const setGenesisBlock = (block) => genesisBlock = block;

const getGenesisBlock = () => genesisBlock;

const getGenesisBlockId = () => genesisBlock.header.id;

const getGenesisBlockFilePath = async () => {
	if (!_genesisBlockFilePath) {
		const chainID = await getChainID();
		_genesisBlockFilePath = `./data/${chainID}/genesis_block.json`;
	}
	return _genesisBlockFilePath;
};

// eslint-disable-next-line consistent-return
const downloadAndValidateGenesisBlock = async (retries = 2) => {
	const genesisBlockFilePath = await getGenesisBlockFilePath();
	const genesisBlockUrl = await getGenesisBlockUrl();
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

			if (isValidGenesisBlock) {
				// Extract if downloaded file is a tar archive
				if (genesisFilePath.endsWith('.tar.gz')) await extractTarBall(genesisFilePath, directoryPath);

				return true;
			}

			// Delete all previous files including the containing directory if genesis block is not valid
			await rm(directoryPath, { recursive: true, force: true });
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

const formatGenesisBlock = async (block) => {
	const blockHeader = block.header;

	const blockAssets = await BluebirdPromise.map(
		block.assets,
		async (asset) => {
			const assetModule = asset.module;
			const blockAssetDataSchema = await getBlockAssetDataSchemaByModule(assetModule);
			const formattedAssetData = blockAssetDataSchema
				? codec.decodeJSON(blockAssetDataSchema, Buffer.from(asset.data, 'hex'))
				: asset.data;

			if (!blockAssetDataSchema) {
				// TODO: Remove this after all asset schemas are exposed
				console.error(`Block asset schema missing for module ${assetModule}.`);
				logger.error(`Unable to decode asset data. Block asset schema missing for module ${assetModule}.`);
			}

			const formattedBlockAsset = {
				module: assetModule,
				data: formattedAssetData,
			};
			return formattedBlockAsset;
		},
		{ concurrency: block.assets.length },
	);

	// Genesis block does not have any transactions
	const blockTransactions = [];

	const formattedBlock = {
		header: blockHeader,
		assets: blockAssets,
		transactions: blockTransactions,
	};
	return parseToJSONCompatObj(formattedBlock);
};

const getGenesisBlockFromFS = async () => {
	const genesisBlockFilePath = await getGenesisBlockFilePath();

	if (!getGenesisBlockId()) {
		if (!(await exists(genesisBlockFilePath))) {
			await downloadAndValidateGenesisBlock();
		}
		const readStream = fs.createReadStream(genesisBlockFilePath);

		const block = await new Promise((resolve, reject) => {
			readStream.pipe(parseStream.on('data', (data) => resolve(data)));
			parseStream.on('error', (err) => reject(err));
		});

		const formattedBlock = await formatGenesisBlock(block);

		if (!getGenesisBlockId()) setGenesisBlock(formattedBlock);
	}

	return getGenesisBlock();
};

module.exports = {
	getGenesisBlockFromFS,
};
