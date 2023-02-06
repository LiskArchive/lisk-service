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
const waitForIt = require('../../shared/utils/waitForIt');

let testValue = false;

describe('Unit test for waitForIt utility', () => {
	it('should wait for the function to invoke', async () => {
		const testFn = () => testValue = true;
		expect(testValue).toBe(false);
		await waitForIt(testFn);
		expect(testValue).toBe(true);
	});

	it('should wait for the mocked function to invoke', async () => {
		const testFn = jest.fn().mockReturnValue(true);

		expect(testFn).toHaveBeenCalledTimes(0);
		await waitForIt(testFn);
		expect(testFn).toHaveBeenCalledTimes(1);
		await waitForIt(testFn);
		expect(testFn).toHaveBeenCalledTimes(2);
	});
});
