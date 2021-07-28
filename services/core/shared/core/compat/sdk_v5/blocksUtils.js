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
	CacheRedis,
	Logger,
	HTTP: { request },
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const { exists } = require('../../../fsUtils');
const config = require('../../../../config');

const logger = Logger();

let readStream;
let genesisBlockURL;
let genesisBlockFilePath;
let genesisBlock = { header: {} };

const constantsCache = CacheRedis('networkConstants', config.endpoints.redis);

const parseStream = json.createParseStream();

const setGenesisBlock = (block) => genesisBlock = block;

const getGenesisBlock = () => genesisBlock;

const getGenesisBlockId = () => genesisBlock.header.id;

const loadConfig = async () => {
	const { data: { networkIdentifier } } = JSON.parse(await constantsCache.get('networkConstants'));

	const [networkConfig] = config.network.filter(c => [networkIdentifier, 'default'].includes(c.identifier));
	genesisBlockURL = networkConfig.genesisBlockUrl;
	logger.debug(`genesisBlockURL set to ${genesisBlockURL}`);

	genesisBlockFilePath = `./data/${networkConfig.name}/genesis_block.json`;
	logger.debug(`genesisBlockFilePath set to ${genesisBlockFilePath}`);

	// If file exists, already create a read stream
	if (await exists(genesisBlockFilePath)) readStream = fs.createReadStream(genesisBlockFilePath);
};

const downloadGenesisBlock = async () => {
	const directoryPath = path.dirname(genesisBlockFilePath);
	if (!(await exists(directoryPath))) fs.mkdirSync(directoryPath, { recursive: true });

	logger.info(`Downloading genesis block to the filesystem from: ${genesisBlockURL}`);

	return new Promise((resolve, reject) => {
		if (genesisBlockURL.endsWith('.tar.gz')) {
			https.get(genesisBlockURL, (response) => {
				if (response.statusCode === 200) {
					response.pipe(tar.extract({ cwd: directoryPath }));
					response.on('error', async (err) => reject(err));
					response.on('end', async () => {
						logger.info('Genesis block download successful');
						return setTimeout(resolve, 500);
					});
				} else {
					const errMessage = `Download failed with HTTP status code: ${response.statusCode} (${response.statusMessage})`;
					logger.error(errMessage);
					if (response.statusCode === 404) throw new NotFoundException(errMessage);
					throw new Error(errMessage);
				}
			});
		} else {
			request(genesisBlockURL)
				.then(async response => {
					const block = typeof response === 'string' ? JSON.parse(response).data : response.data;
					fs.writeFile(genesisBlockFilePath, JSON.stringify(block), () => {
						logger.info('Genesis block download successful');
						return resolve();
					});
				})
				.catch(err => reject(err));
		}
	});
};

const getGenesisBlockFromFS = async () => {
	if (!genesisBlockURL || !genesisBlockFilePath) await loadConfig();
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
