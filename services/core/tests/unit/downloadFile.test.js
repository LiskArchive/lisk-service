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

const {
	downloadAndExtractTarball,
	// downloadJSONFile,
} = require('../../shared/downloadFile');

const config = require('../../config');

const directoryPath = path.join(__dirname);

describe('downloadFile utility tests', () => {
	describe('downloadAndExtractTarball', () => {
		it('downloadAndExtractTarball -> valid url', async () => {
			const url = config.networks.filter(acc => acc.name === 'testnet')[0];
			const filePath = `${directoryPath}/genesis_block.json`;
			await downloadAndExtractTarball(url.genesisBlockUrl, directoryPath);
			const result = !!(await fs.promises.stat(filePath).catch(() => null));
			expect(result).toEqual(true);
			await fs.unlinkSync(filePath);
		});

		it('downloadAndExtractTarball -> invalid url', async () => {
			const url = 'https://downloads.lisk.com/lisk/testnet/genesis_block1.json.tar.gz';
			expect(downloadAndExtractTarball(url, directoryPath)).rejects.toThrow();
		});
	});
});
