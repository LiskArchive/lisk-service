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
const moment = require('moment');

const config = require('../../../../config');

const { interval } = require('../../../constants/csvExport');
const { STANDARDIZED_INTERVAL } = require('../../../../shared/regex');
const { timestamp, expectedDate, expectedTime } = require('../../../constants/time');
const {
	dateFromTimestamp,
	timeFromTimestamp,
	getToday,
	standardizeIntervalFromParams,
} = require('../../../../shared/helpers/time');

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

describe('Test getToday method', () => {
	it(`should return current date in '${config.excel.dateFormat}' format`, async () => {
		const today = getToday();
		expect(today).toBe(moment().format(config.excel.dateFormat));
	});
});

describe('Test standardizeIntervalFromParams method', () => {
	it('should return standardized interval when both start and end date supplied', async () => {
		const result = await standardizeIntervalFromParams({ interval: interval.startEnd });
		expect(typeof result).toBe('string');
		expect(result.length).toBe(2 * config.excel.dateFormat.length + 1);
		expect(result).toMatch(STANDARDIZED_INTERVAL);
	});

	it('should return standardized interval when only start date supplied', async () => {
		const result = await standardizeIntervalFromParams({ interval: interval.onlyStart });
		expect(typeof result).toBe('string');
		expect(result.length).toBe(2 * config.excel.dateFormat.length + 1);
		expect(result).toMatch(STANDARDIZED_INTERVAL);
	});

	xit('should return standardized interval when dates not supplied', async () => {
		const result = await standardizeIntervalFromParams({});
		expect(typeof result).toBe('string');
		expect(result.length).toBe(2 * config.excel.dateFormat.length + 1);
		expect(result).toMatch(STANDARDIZED_INTERVAL);
	});
});
