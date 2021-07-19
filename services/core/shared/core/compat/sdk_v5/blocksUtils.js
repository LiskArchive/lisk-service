/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const https = require('https');
const json = require('big-json');
const path = require('path');
const tar = require('tar');

const {
	Logger,
	HTTP: { request },
} = require('lisk-service-framework');

const config = require('../../../../config');

const logger = Logger();

const genesisBlockURL = config.endpoints.genesisBlock;

const genesisBlockFilePath = './shared/core/compat/sdk_v5/static/genesis_block.json';

let readStream;
let genesisBlock = { header: {} };

const parseStream = json.createParseStream();

const setGenesisBlock = (block) => genesisBlock = block;

const getGenesisBlock = () => genesisBlock;

const getGenesisBlockId = () => genesisBlock.header.id;

const downloadGenesisBlock = async () => {
	const directoryPath = path.dirname(genesisBlockFilePath);
	if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath);

	logger.info(`Downloading genesis block to the filesystem from: ${genesisBlockURL}`);

	return new Promise((resolve, reject) => {
		if (genesisBlockURL.endsWith('.tar.gz')) {
			https.get(genesisBlockURL, (response) => {
				response.pipe(tar.extract({ cwd: directoryPath }));
				response.on('error', async (err) => reject(err));
				response.on('end', async () => setTimeout(resolve, 500));
			});
		} else {
			request(genesisBlockURL)
				.then(async response => {
					const genesisBlock = typeof response === 'string' ? JSON.parse(response).data : response.data;
					fs.writeFile(genesisBlockFilePath, JSON.stringify(genesisBlock), () => resolve());
				})
				.catch(err => reject(err));
		}
	});
};

const getGenesisBlockFromFS = async () => {
	if (!getGenesisBlockId()) {
		if (!fs.existsSync(genesisBlockFilePath)) {
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

// If file exists, already create a read stream
if (fs.existsSync(genesisBlockFilePath)) readStream = fs.createReadStream(genesisBlockFilePath);

module.exports = {
	getGenesisBlockId,
	getGenesisBlockFromFS,
};
