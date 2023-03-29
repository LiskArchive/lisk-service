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

const waitForIt = require('../../../shared/waitForIt');

const delay = (ms = 100, val) => new Promise(resolve => setTimeout(resolve.bind(null, val), ms));

describe('Test waitForIt method', () => {
	it('should wait for the function to return response', async () => {
		let testValue = false;
		const testFn = () => testValue = true;

		expect(testValue).toBe(false);
		await waitForIt(testFn);
		expect(testValue).toBe(true);
	});

	it('should wait for the test function to return response with delay of 1000ms', async () => {
		const delayMs = 1000;
		const testFn = async () => {
			await delay(delayMs);
			return true;
		};
		const startTime = Date.now();
		await waitForIt(testFn);
		const endTime = Date.now();
		const millisDifference = endTime - startTime;
		expect(millisDifference).toBeGreaterThanOrEqual(delayMs);
	});

	it('should wait for the mocked function to return response', async () => {
		const testFn = jest.fn().mockReturnValue(true);

		expect(testFn).toHaveBeenCalledTimes(0);
		await waitForIt(testFn);
		expect(testFn).toHaveBeenCalledTimes(1);
		await waitForIt(testFn);
		expect(testFn).toHaveBeenCalledTimes(2);
	});

	it('should throw error when passing invalid function', async () => {
		const testFn = 'invalid';
		expect(waitForIt(testFn)).rejects.toThrow();
	});

	it('should throw error when passing function as null', async () => {
		expect(waitForIt(null)).rejects.toThrow();
	});

	it('should throw error when passing function as undefined', async () => {
		expect(waitForIt(undefined)).rejects.toThrow();
	});

	it('should throw error when passing function as empty string', async () => {
		expect(waitForIt('')).rejects.toThrow();
	});
});
