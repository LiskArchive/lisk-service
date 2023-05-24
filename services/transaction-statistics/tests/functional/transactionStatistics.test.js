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
const moment = require('moment');

const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { networkStatus } = require('../constants/networkStatus');
const { DATE_FORMAT } = require('../../shared/utils/constants');
const request = require('../../shared/utils/request');
const {
	getSelector,
	getStatsTimeline,
	getDistributionByAmount,
	getDistributionByType,
} = require('../../shared/transactionStatistics');

const txStatisticsIndexSchema = require('../../shared/database/schemas/transactionStatistics');
const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getDBInstance = () => getTableInstance(txStatisticsIndexSchema, MYSQL_ENDPOINT);

jest.mock('../../shared/utils/request');

const validIntervals = ['day', 'month'];

describe('Tests transactionStatistics', () => {
	const testTokenID = 'ffffffffffffffff';
	// Invalid params because missing tokenIDs
	const invalidParams = {
		dateFormat: DATE_FORMAT.MONTH,
		dateTo: moment().endOf(),
		dateFrom: moment().startOf(),
	};
	let testData;
	let db;

	beforeAll(async () => {
		jest.spyOn(request, 'requestIndexer').mockReturnValue(networkStatus);
		testData = {
			id: 'testEntry',
			amount_range: '0_0',
			moduleCommand: 'test:stats',
			tokenID: 'ffffffffffffffff',
			count: 10,
			date: Math.floor(Date.now() / 1000),
			volume: BigInt('100'),
		};

		db = await getDBInstance();
		await db.upsert(testData);
	});

	afterAll(async () => {
		await db.deleteByPrimaryKey(testData.id);
		await jest.clearAllMocks();
	});

	describe('Test getSelector method', () => {
		validIntervals.forEach(interval => {
			it(`should return correct response with valid params ->  ${interval} interval`, async () => {
				const params = {
					dateTo: moment().endOf(interval),
					dateFrom: moment().startOf(interval),
				};
				const result = await getSelector(params);
				expect(typeof result).toBe('object');
				expect(result).toMatchObject({
					sort: 'date:desc',
					limit: (networkStatus.data.moduleCommands.length + 1) * 366,
					propBetweens: [{
						property: 'date',
						from: params.dateFrom.unix(),
						to: params.dateTo.unix(),
					}],
				});
			});

			it(`should return proper response -> ${interval} interval with only dateFrom`, async () => {
				const params = {
					dateFrom: moment().startOf(interval),
				};
				const result = await getSelector(params);
				expect(typeof result).toBe('object');
				expect(result).toMatchObject({
					sort: 'date:desc',
					limit: (networkStatus.data.moduleCommands.length + 1) * 366,
					propBetweens: [{
						property: 'date',
						from: params.dateFrom.unix(),
					}],
				});
			});

			it(`should return proper response -> ${interval} interval with only dateTo`, async () => {
				const params = {
					dateTo: moment().startOf(interval),
				};
				const result = await getSelector(params);
				expect(typeof result).toBe('object');
				expect(result).toMatchObject({
					sort: 'date:desc',
					limit: (networkStatus.data.moduleCommands.length + 1) * 366,
					propBetweens: [{
						property: 'date',
						to: params.dateTo.unix(),
					}],
				});
			});

			it(`should return proper response -> ${interval} interval with limit 10`, async () => {
				const params = {
					dateTo: moment().startOf(interval),
					limit: 10,
				};
				const result = await getSelector(params);
				expect(typeof result).toBe('object');
				expect(result).toMatchObject({
					sort: 'date:desc',
					limit: params.limit,
					propBetweens: [{
						property: 'date',
						to: params.dateTo.unix(),
					}],
				});
			});
		});

		it('should return proper response -> empty object params', async () => {
			const params = {};
			const result = await getSelector(params);
			expect(typeof result).toBe('object');
			expect(result).toMatchObject({
				sort: 'date:desc',
				limit: (networkStatus.data.moduleCommands.length + 1) * 366,
			});
		});

		it('should throw error in case of no params', async () => {
			expect(getSelector()).rejects.toThrow();
		});

		it('should throw error in case of undefined params', async () => {
			expect(getSelector(undefined)).rejects.toThrow();
		});

		it('should throw error in case of null params', async () => {
			expect(getSelector(null)).rejects.toThrow();
		});
	});

	describe('Test getStatsTimeline method', () => {
		validIntervals.forEach(interval => {
			it(`should return correct response with valid params -> interval: 1 ${interval}`, async () => {
				const limit = 1;
				const offset = 0;
				const dateFormat = DATE_FORMAT[interval.toUpperCase()];

				const params = {
					dateFormat,
					dateTo: moment()
						.endOf(interval)
						.subtract(offset, interval),
					dateFrom: moment(moment().startOf(interval).subtract(offset, interval))
						.startOf(interval)
						.subtract(limit - 1, interval),
					tokenIDs: [testTokenID],
				};

				const result = await getStatsTimeline(params);
				expect(typeof result).toBe('object');
				expect(Object.getOwnPropertyNames(result).length).toBeGreaterThanOrEqual(1);
				Object.keys(result).forEach(key => {
					expect(result[key]).toBeInstanceOf(Array);
					expect(result[key].length).toBeGreaterThanOrEqual(1);
					expect(result[key].length).toBeLessThanOrEqual(limit);
					if (result[key].length) {
						result[key].forEach(timeline => {
							expect(typeof timeline).toBe('object');
							if (key === testTokenID) {
								const formattedDate = moment.unix(testData.date).format(dateFormat);
								const testDataEntry = result[key].find(entry => entry.date === formattedDate);
								expect(testDataEntry).toMatchObject({
									timestamp: Date.parse(formattedDate) / 1000,
									transactionCount: testData.count,
									volume: Number(testData.volume),
									date: formattedDate,
								});
							}
						});
					}
				});
			});

			it(`should return correct response with valid params -> interval: 10 ${interval}`, async () => {
				const limit = 10;
				const offset = 0;
				const dateFormat = DATE_FORMAT[interval.toUpperCase()];

				const params = {
					dateFormat,
					dateTo: moment()
						.endOf(interval)
						.subtract(offset, interval),
					dateFrom: moment(moment().startOf(interval).subtract(offset, interval))
						.startOf(interval)
						.subtract(limit - 1, interval),
					tokenIDs: [testTokenID],
				};

				const result = await getStatsTimeline(params);
				expect(typeof result).toBe('object');
				expect(Object.getOwnPropertyNames(result).length).toBeGreaterThanOrEqual(1);
				Object.keys(result).forEach(key => {
					expect(result[key]).toBeInstanceOf(Array);
					expect(result[key].length).toBeGreaterThanOrEqual(1);
					expect(result[key].length).toBeLessThanOrEqual(limit);
					if (result[key].length) {
						result[key].forEach(timeline => {
							expect(typeof timeline).toBe('object');
							if (key === testTokenID) {
								const formattedDate = moment.unix(testData.date).format(dateFormat);
								const testDataEntry = result[key].find(entry => entry.date === formattedDate);
								expect(testDataEntry).toMatchObject({
									timestamp: Date.parse(formattedDate) / 1000,
									transactionCount: testData.count,
									volume: Number(testData.volume),
									date: formattedDate,
								});
							}
						});
					}
				});
			});
		});

		it('should throw error in case of invalid params', async () => {
			expect(getStatsTimeline(invalidParams)).rejects.toThrow();
		});

		it('should throw error in case of no params', async () => {
			expect(getStatsTimeline()).rejects.toThrow();
		});

		it('should throw error in case of undefined params', async () => {
			expect(getStatsTimeline(undefined)).rejects.toThrow();
		});

		it('should throw error in case of null params', async () => {
			expect(getStatsTimeline(null)).rejects.toThrow();
		});
	});

	describe('Test getDistributionByAmount method', () => {
		validIntervals.forEach(interval => {
			it(`should return correct response with valid params -> interval: 1 ${interval}`, async () => {
				const limit = 1;
				const offset = 0;
				const dateFormat = DATE_FORMAT[interval.toUpperCase()];

				const params = {
					dateFormat,
					dateTo: moment()
						.endOf(interval)
						.subtract(offset, interval),
					dateFrom: moment(moment().startOf(interval).subtract(offset, interval))
						.startOf(interval)
						.subtract(limit - 1, interval),
					tokenIDs: [testTokenID],
				};

				const result = await getDistributionByAmount(params);
				expect(typeof result).toBe('object');
				expect(Object.getOwnPropertyNames(result).length).toBeGreaterThanOrEqual(1);
				Object.keys(result).forEach(key => {
					expect(typeof result[key]).toBe('object');
					if (key === testTokenID) {
						expect(result[key]).toMatchObject({
							[testData.amount_range]: testData.count,
						});
					}
				});
			});

			it(`should return correct response with valid params -> interval: 10 ${interval}`, async () => {
				const limit = 10;
				const offset = 0;
				const dateFormat = DATE_FORMAT[interval.toUpperCase()];

				const params = {
					dateFormat,
					dateTo: moment()
						.endOf(interval)
						.subtract(offset, interval),
					dateFrom: moment(moment().startOf(interval).subtract(offset, interval))
						.startOf(interval)
						.subtract(limit - 1, interval),
					tokenIDs: [testTokenID],
				};

				const result = await getDistributionByAmount(params);
				expect(typeof result).toBe('object');
				expect(Object.getOwnPropertyNames(result).length).toBeGreaterThanOrEqual(1);
				Object.keys(result).forEach(key => {
					expect(typeof result[key]).toBe('object');
					if (key === testTokenID) {
						expect(result[key]).toMatchObject({
							[testData.amount_range]: testData.count,
						});
					}
				});
			});
		});

		it('should throw error in case of invalid params', async () => {
			expect(getDistributionByAmount(invalidParams)).rejects.toThrow();
		});

		it('should throw error in case of no params', async () => {
			expect(getDistributionByAmount()).rejects.toThrow();
		});

		it('should throw error in case of undefined params', async () => {
			expect(getDistributionByAmount(undefined)).rejects.toThrow();
		});

		it('should throw error in case of null params', async () => {
			expect(getDistributionByAmount(null)).rejects.toThrow();
		});
	});

	describe('Test getDistributionByType method', () => {
		validIntervals.forEach(interval => {
			it(`should return correct response with valid params -> interval: 1 ${interval}`, async () => {
				const limit = 1;
				const offset = 0;
				const dateFormat = DATE_FORMAT[interval.toUpperCase()];

				const params = {
					dateFormat,
					dateTo: moment()
						.endOf(interval)
						.subtract(offset, interval),
					dateFrom: moment(moment().startOf(interval).subtract(offset, interval))
						.startOf(interval)
						.subtract(limit - 1, interval),
					tokenIDs: [testTokenID],
				};

				const result = await getDistributionByType(params);
				expect(typeof result).toBe('object');
				expect(result).toEqual(expect.objectContaining({
					[testData.moduleCommand]: testData.count,
				}));
			});

			it(`should return correct response with valid params -> interval: 10 ${interval}`, async () => {
				const limit = 10;
				const offset = 0;
				const dateFormat = DATE_FORMAT[interval.toUpperCase()];

				const params = {
					dateFormat,
					dateTo: moment()
						.endOf(interval)
						.subtract(offset, interval),
					dateFrom: moment(moment().startOf(interval).subtract(offset, interval))
						.startOf(interval)
						.subtract(limit - 1, interval),
					tokenIDs: [testTokenID],
				};

				const result = await getDistributionByType(params);
				expect(typeof result).toBe('object');
				expect(result).toEqual(expect.objectContaining({
					[testData.moduleCommand]: testData.count,
				}));
			});
		});

		it('should throw error in case of no params', async () => {
			expect(getDistributionByType()).rejects.toThrow();
		});

		it('should throw error in case of undefined params', async () => {
			expect(getDistributionByType(undefined)).rejects.toThrow();
		});

		it('should throw error in case of null params', async () => {
			expect(getDistributionByType(null)).rejects.toThrow();
		});
	});
});
