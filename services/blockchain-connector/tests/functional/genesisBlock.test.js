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
const { ServiceBroker } = require('moleculer');
const fs = require('fs');
const crypto = require('crypto');

const { exists } = require('../../shared/fsUtils');
const config = require('../../config');

const broker = new ServiceBroker({
	transporter: config.transporter,
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});

describe('Genesis Block import tests', () => {
	let genesisBlockFilePath;

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	it('Verify if genesis block is downloaded successfully', async () => {
		const nodeInfo = await broker.call('connector.getNetworkStatus');
		genesisBlockFilePath = `./data/${nodeInfo.data.networkIdentifier}/genesis_block.json.tar.gz`;

		const isExists = await exists(genesisBlockFilePath);
		expect(isExists).toBe(true);
	});

	it('Validate genesis block', async () => {
		const genesisBlockSHAFilePath = genesisBlockFilePath.concat('.SHA256');
		const isExists = await exists(genesisBlockSHAFilePath);
		expect(isExists).toBe(true);

		const expectedHash = (fs.readFileSync(genesisBlockSHAFilePath, 'utf8')).split(' ')[0];

		const fileStream = fs.createReadStream(genesisBlockFilePath);
		const dataHash = crypto.createHash('sha256');

		const fileHash = await new Promise(resolve => {
			fileStream.on('data', (data) => {
				dataHash.update(data);
			});

			fileStream.on('end', () => {
				resolve(dataHash.digest());
			});
		});

		const fileChecksum = fileHash.toString('hex');
		expect(expectedHash).toEqual(fileChecksum);
	});
});
