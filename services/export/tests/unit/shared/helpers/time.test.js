/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	dateFromTimestamp,
	timeFromTimestamp,
} = require('../../../../shared/helpers/time');

const {
	timestamp,
	expectedDate,
	expectedTime,
} = require('../../../constants/time');

describe('Time utils', () => {
	it('returns ISO format UTC Date from unix timestamp', async () => {
		const date = dateFromTimestamp(timestamp);
		expect(date).toBe(expectedDate);
	});

	it('returns ISO format UTC Time from unix timestamp', async () => {
		const time = timeFromTimestamp(timestamp);
		expect(time).toBe(expectedTime);
	});
});
