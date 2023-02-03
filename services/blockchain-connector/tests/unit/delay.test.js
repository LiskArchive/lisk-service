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

describe('Unit test for delay utility', () => {
	it('Add delay -> 2ms', async () => {
		const delayMs = 2000;
		const startTime = Date.now();
		await delay(delayMs);
		const endTime = Date.now();
		const millisDifference = endTime - startTime;
		expect(millisDifference).toBeGreaterThanOrEqual(delayMs);
	});

	it('Add delay -> 4ms', async () => {
		const delayMs = 4000;
		const startTime = Date.now();
		await delay(delayMs);
		const endTime = Date.now();
		const millisDifference = endTime - startTime;
		expect(millisDifference).toBeGreaterThanOrEqual(delayMs);
	});
});
