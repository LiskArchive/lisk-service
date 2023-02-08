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
const delay = require('../../shared/utils/delay');

describe('Test delay method', () => {
	it('should delay even without any arguments', async () => {
		const startTime = Date.now();
		await delay();
		const endTime = Date.now();
		const millisDifference = endTime - startTime;
		expect(millisDifference).toBeGreaterThan(0);
	});

	it('should add delay of 2000ms', async () => {
		const delayMs = 2000;
		const startTime = Date.now();
		await delay(delayMs);
		const endTime = Date.now();
		const millisDifference = endTime - startTime;
		expect(millisDifference).toBeGreaterThanOrEqual(delayMs);
	});
});
