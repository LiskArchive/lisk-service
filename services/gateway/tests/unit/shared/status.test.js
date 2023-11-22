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

const fs = require('fs');
const path = require('path');
const {
	Utils: {
		fs: { exists, rmdir },
	},
} = require('lisk-service-framework');

describe('Test getBuildTimestamp method', () => {
	const dateStr = '2999-03-21T11:15:59.337Z';
	const jsonStr = `{"timestamp": "${dateStr}"}`;
	const filePath = path.resolve(__dirname, '../../../build.json');

	it('should return current time from the file when build.json file exists', async () => {
		const isExists = await exists(filePath);

		if (!isExists) {
			await fs.promises.writeFile(filePath, jsonStr);
		}

		const { getBuildTimestamp } = require('../../../shared/status');
		const response = await getBuildTimestamp();
		expect(response).toEqual(dateStr);

		if (!isExists) await rmdir(filePath);
	});

	it('should return current time when build.json file does not exists', async () => {
		const curDate = new Date();
		const { getBuildTimestamp } = require('../../../shared/status');
		const response = await getBuildTimestamp();
		expect(new Date(response).getTime()).toBeGreaterThanOrEqual(curDate.getTime());
	});
});
