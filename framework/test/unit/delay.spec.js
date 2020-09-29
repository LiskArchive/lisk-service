/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const delay = require('../../src/delay');

describe('isProperObject()', () => {
	const delay_time = 20;
	const justLikeEnum = { original: 'original', updated: 'original' };


	test('return unchanged ', async () => {
		let data = justLikeEnum.original;

		setTimeout(() => {
			expect(data).toBe(justLikeEnum.original);
		 }, delay_time - 1);

		 await delay(delay_time);
		 data = justLikeEnum.updated;
	});

	test('returns true on empty objects', async () => {
		let data = justLikeEnum.original;

		setTimeout(() => {
			expect(data).toBe(justLikeEnum.updated);
		 }, delay_time + 1);

		 await delay(delay_time);
		 data = justLikeEnum.updated;
	});
});
