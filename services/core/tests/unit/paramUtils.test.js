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
const {
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const {
	normalizeRangeParam,
} = require('../../shared/core/compat/sdk_v5/paramUtils');

describe('paramUtils tests', () => {
	const property = 'amount';
	it('Return normalized params in case of valid range', async () => {
		const params = { amount: '11:100' };
		const normalizedParams = normalizeRangeParam(params, property);
		expect(typeof normalizedParams).toBe('object');
		expect(normalizedParams.propBetweens).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					property,
					from: 11,
					to: 100,
				}),
			]),
		);
	});

	it('Throw error in case of invalid range', async () => {
		try {
			const params = { amount: '1000:100' };
			normalizeRangeParam(params, property);
		} catch (error) {
			expect(error).toBeInstanceOf(ValidationException);
			expect(error).toHaveProperty('message', `From ${property} cannot be greater than to ${property}.`);
		}
	});
});
