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

const { safeTestRegex } = require('../../../shared/moleculer-io/util');

describe('safeTestRegex', () => {
	it('should return false for safe regex and non-matching action', () => {
		const regex = /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/;
		const action = '123-45-6789';
		const result = safeTestRegex(regex, action);
		expect(result).toBe(false);
	});

	it('should return false for unsafe regex', () => {
		const regex = /^([a-zA-Z]+)*$/;
		const action = 'attack';
		const result = safeTestRegex(regex, action);
		expect(result).toBe(false);
	});

	it('should return false for safe regex and invalid action format', () => {
		const regex = /^[0-9]{2}:[0-9]{2}$/;
		const action = '12345';
		const result = safeTestRegex(regex, action);
		expect(result).toBe(false);
	});

	it('should return false for null regex', () => {
		const regex = null;
		const action = 'test';
		const result = safeTestRegex(regex, action);
		expect(result).toBe(false);
	});

	it('should return false for undefined regex', () => {
		const regex = undefined;
		const action = 'test';
		const result = safeTestRegex(regex, action);
		expect(result).toBe(false);
	});

	it('should return false for safe regex and null action', () => {
		const regex = /^[a-z]+$/;
		const action = null;
		const result = safeTestRegex(regex, action);
		expect(result).toBe(false);
	});

	it('should return false for safe regex and undefined action', () => {
		const regex = /^[a-z]+$/;
		const action = undefined;
		const result = safeTestRegex(regex, action);
		expect(result).toBe(false);
	});
});
