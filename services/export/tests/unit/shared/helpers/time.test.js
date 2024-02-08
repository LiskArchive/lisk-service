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
const { resolve } = require('path');
const moment = require('moment');

const config = require('../../../../config');

const { interval } = require('../../../constants/csvExport');
const { STANDARDIZED_INTERVAL } = require('../../../../shared/regex');
const { timestamp, expectedDate, expectedTime } = require('../../../constants/time');

const mockedChainFilePath = resolve(`${__dirname}/../../../../shared/helpers/chain`);

beforeEach(() => jest.resetModules());

describe('Time utils', () => {
	it('returns ISO format UTC Date from unix timestamp', async () => {
		const { dateFromTimestamp } = require('../../../../shared/helpers/time');
		const date = dateFromTimestamp(timestamp);
		expect(date).toBe(expectedDate);
	});

	it('returns ISO format UTC Time from unix timestamp', async () => {
		const { timeFromTimestamp } = require('../../../../shared/helpers/time');
		const time = timeFromTimestamp(timestamp);
		expect(time).toBe(expectedTime);
	});
});

describe('Test getToday method', () => {
	it(`should return current date in '${config.excel.dateFormat}' format`, async () => {
		const { getToday } = require('../../../../shared/helpers/time');
		const today = getToday();
		expect(today).toBe(moment().format(config.excel.dateFormat));
	});
});

describe('Test standardizeIntervalFromParams method', () => {
	it('should return standardized interval when both start and end date supplied', async () => {
		const { standardizeIntervalFromParams } = require('../../../../shared/helpers/time');
		const result = await standardizeIntervalFromParams({ interval: interval.startEnd });
		expect(typeof result).toBe('string');
		expect(result.length).toBe(2 * config.excel.dateFormat.length + 1);
		expect(result).toMatch(STANDARDIZED_INTERVAL);
	});

	it('should return standardized interval when only start date supplied', async () => {
		const { standardizeIntervalFromParams } = require('../../../../shared/helpers/time');
		const result = await standardizeIntervalFromParams({ interval: interval.onlyStart });
		expect(typeof result).toBe('string');
		expect(result.length).toBe(2 * config.excel.dateFormat.length + 1);
		expect(result).toMatch(STANDARDIZED_INTERVAL);
	});

	it('should throw error when invalid interval supplied', async () => {
		const { standardizeIntervalFromParams } = require('../../../../shared/helpers/time');
		expect(standardizeIntervalFromParams({ interval: interval.invalid })).rejects.toThrow();
	});

	it('should return standardized interval when dates not supplied', async () => {
		jest.mock(mockedChainFilePath);
		// eslint-disable-next-line import/no-dynamic-require
		const { getNetworkStatus, getBlocks } = require(mockedChainFilePath);
		getNetworkStatus.mockResolvedValueOnce({
			data: {
				genesisHeight: 1,
			},
		});

		getBlocks.mockResolvedValueOnce({
			data: [
				{
					timestamp: 1704198870,
				},
			],
		});

		const { standardizeIntervalFromParams } = require('../../../../shared/helpers/time');
		const result = await standardizeIntervalFromParams({});
		expect(typeof result).toBe('string');
		expect(result.length).toBe(2 * config.excel.dateFormat.length + 1);
		expect(result).toMatch(STANDARDIZED_INTERVAL);
	});
});
