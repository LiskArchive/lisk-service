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
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const { eventsIncludingTokenModule } = require('../../../../constants/events');

const mockedBlockID = '89a9f8dd0e9d15e54268f952b2e9430e799968169376273f715480d058a67dc4';
const mockedEvents = eventsIncludingTokenModule;

const mockEventsFilePath = path.resolve(
	`${__dirname}/../../../../../shared/dataService/business/events`,
);

const mockBlocksTableSchema = require('../../../../../shared/database/schema/blocks');
const mockEventsTableSchema = require('../../../../../shared/database/schema/events');
const mockTransactionsTableSchema = require('../../../../../shared/database/schema/transactions');
const mockEventTopicsTableSchema = require('../../../../../shared/database/schema/eventTopics');
const {
	mockEventTopics,
	mockEventsForEventTopics,
	mockGetEventsResult,
	mockEventTopicsQueryParams,
} = require('../../constants/events');

describe('getEventsByBlockID', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	it('should return events from cache if available', async () => {
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheLRU: jest.fn(() => ({
					get: key => {
						expect(key).toEqual(mockedBlockID);
						return JSON.stringify(mockedEvents);
					},
					set: jest.fn(),
				})),
				DB: {
					MySQL: {
						getTableInstance: jest.fn(),
					},
				},
			};
		});

		const { getEventsByBlockID } = require(mockEventsFilePath);
		const events = await getEventsByBlockID(mockedBlockID);
		expect(events).toEqual(mockedEvents);
	});

	it('should return events from DB if not available in cache', async () => {
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheLRU: jest.fn(() => ({
					get: key => {
						expect(key).toEqual(mockedBlockID);
						return undefined;
					},
					set: jest.fn(),
				})),
				DB: {
					MySQL: {
						getTableInstance: () => ({
							find: params => {
								expect(params).toEqual({ blockID: mockedBlockID });
								const dbResp = [];

								for (let i = 0; i < mockedEvents.length; i++) {
									const eventStr = JSON.stringify(mockedEvents[i]);
									dbResp.push({ eventStr });
								}

								return dbResp;
							},
						}),
					},
				},
			};
		});

		const { getEventsByBlockID } = require(mockEventsFilePath);
		const events = await getEventsByBlockID(mockedBlockID);
		expect(events).toEqual(mockedEvents);
	});

	it('should return an empty array if cache and db miss', async () => {
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheLRU: jest.fn(() => ({
					get: key => {
						expect(key).toEqual(mockedBlockID);
						return undefined;
					},
					set: jest.fn(),
				})),
				DB: {
					MySQL: {
						getTableInstance: () => ({
							find: params => {
								expect(params).toEqual({ blockID: mockedBlockID });
								return [];
							},
						}),
					},
				},
			};
		});

		const { getEventsByBlockID } = require(mockEventsFilePath);
		const events = await getEventsByBlockID(mockedBlockID);
		expect(events).toEqual([]);
	});
});

describe('cacheEventsByBlockID', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	it('should cache events by blockID', async () => {
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheLRU: jest.fn(() => ({
					get: jest.fn(),
					set: (key, value) => {
						expect(key).toEqual(mockedBlockID);
						expect(value).toEqual(JSON.stringify(mockedEvents));
					},
				})),
				DB: {
					MySQL: {
						getTableInstance: jest.fn(),
					},
				},
			};
		});

		const { cacheEventsByBlockID } = require(mockEventsFilePath);
		await cacheEventsByBlockID(mockedBlockID, mockedEvents);
	});

	it('should throw error if cache throws error', async () => {
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheLRU: jest.fn(() => ({
					get: jest.fn(),
					set: () => {
						throw new Error('error');
					},
				})),
				DB: {
					MySQL: {
						getTableInstance: jest.fn(),
					},
				},
			};
		});

		const { cacheEventsByBlockID } = require(mockEventsFilePath);
		expect(() => cacheEventsByBlockID(mockedBlockID, mockedEvents)).rejects.toThrow();
	});
});

describe('getEvents', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	it('should retrieve events successfully', async () => {
		const blockID = '793acee22acea7f4f474e2f8e9e24cb9220da2fc2405026214b5d72a152cb55d';

		jest.mock('../../../../../config', () => {
			const actual = jest.requireActual('../../../../../config');
			return {
				...actual,
				db: {
					...actual.db,
					isPersistEvents: true,
				},
			};
		});

		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				DB: {
					MySQL: {
						getTableInstance: jest.fn(schema => {
							if (schema.tableName === mockBlocksTableSchema.tableName) {
								return {
									find: jest.fn(queryParams => {
										if (queryParams.id) {
											expect(queryParams.id).toBe(blockID);
										}

										return [
											{
												blockID,
												height: 123,
											},
										];
									}),
								};
							}
							if (schema.tableName === mockTransactionsTableSchema.tableName) {
								const txIDs = mockGetEventsResult.data.reduce((acc, event) => {
									const eventTopics = event.topics || [];
									eventTopics
										.filter(topic => topic.length === 64)
										.forEach(topic => {
											const topicObject = { id: topic };
											acc.push(topicObject);
										});
									return acc;
								}, []);

								return {
									find: jest.fn(() => txIDs),
									count: jest.fn(() => 10),
								};
							}
							if (schema.tableName === mockEventsTableSchema.tableName) {
								return {
									find: jest.fn(() => mockEventsForEventTopics),
									count: jest.fn(() => 10),
								};
							}
							if (schema.tableName === mockEventTopicsTableSchema.tableName) {
								return {
									find: jest.fn(queryParams => {
										expect(queryParams).toEqual(mockEventTopicsQueryParams);
										return mockEventsForEventTopics;
									}),
									count: jest.fn(() => 10),
								};
							}
							throw new Error();
						}),
					},
				},
			};
		});

		const params = {
			blockID,
			topic: '03',
			senderAddress: 'lskw68y3kyus7ota9mykr726aby44mw574m8dkngu',
			transactionID: 'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			timestamp: '1:1000000000',
			height: '1:1000',
			sort: 'timestamp:desc',
			order: 'index:asc',
			limit: 10,
			offset: 0,
		};

		const paramsWithTopicTxIDPadded = {
			...params,
			transactionID: '04c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
		};

		const { getEvents } = require(mockEventsFilePath);
		const result = await getEvents(params);
		const resultWithTxIDPadded = await getEvents(paramsWithTopicTxIDPadded);

		expect(result).toEqual(mockGetEventsResult);
		expect(resultWithTxIDPadded).toEqual(mockGetEventsResult);
	});

	it('should retrieve events successfully with transactions ID passed as topic', async () => {
		const blockID = '793acee22acea7f4f474e2f8e9e24cb9220da2fc2405026214b5d72a152cb55d';

		jest.mock('../../../../../config', () => {
			const actual = jest.requireActual('../../../../../config');
			return {
				...actual,
				db: {
					...actual.db,
					isPersistEvents: true,
				},
			};
		});

		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				DB: {
					MySQL: {
						getTableInstance: jest.fn(schema => {
							if (schema.tableName === mockBlocksTableSchema.tableName) {
								return {
									find: jest.fn(queryParams => {
										if (queryParams.id) {
											expect(queryParams.id).toBe(blockID);
										}

										return [
											{
												blockID,
												height: 123,
											},
										];
									}),
								};
							}
							if (schema.tableName === mockTransactionsTableSchema.tableName) {
								const txIDs = mockGetEventsResult.data.reduce((acc, event) => {
									const eventTopics = event.topics || [];
									eventTopics
										.filter(topic => topic.length === 64)
										.forEach(topic => {
											const topicObject = { id: topic };
											acc.push(topicObject);
										});
									return acc;
								}, []);

								return {
									find: jest.fn(() => txIDs),
									count: jest.fn(() => 10),
								};
							}
							if (schema.tableName === mockEventsTableSchema.tableName) {
								return {
									find: jest.fn(() => mockEventsForEventTopics),
									count: jest.fn(() => 10),
								};
							}
							if (schema.tableName === mockEventTopicsTableSchema.tableName) {
								return {
									find: jest.fn(queryParams => {
										expect(queryParams).toEqual(mockEventTopicsQueryParams);
										return mockEventsForEventTopics;
									}),
									count: jest.fn(() => 10),
								};
							}
							throw new Error();
						}),
					},
				},
			};
		});

		const params = {
			blockID,
			senderAddress: 'lskw68y3kyus7ota9mykr726aby44mw574m8dkngu',
			topic: 'c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
			timestamp: '1:1000000000',
			height: '1:1000',
			sort: 'timestamp:desc',
			order: 'index:asc',
			limit: 10,
			offset: 0,
		};

		const paramsWithTopicTxIDPadded = {
			...params,
			topic: '04c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
		};

		const paramsWithTopicTxIDPaddedWithCCMID = {
			...params,
			topic: '05c8ee3933cc841287d834f74f278ac12f145f320d0593a612e11b67b4a58cd17b',
		};

		const { getEvents } = require(mockEventsFilePath);
		const result = await getEvents(params);
		const resultWithTxIDPadded = await getEvents(paramsWithTopicTxIDPadded);
		const resultWithTxIDPaddedWithCCMID = await getEvents(paramsWithTopicTxIDPaddedWithCCMID);

		expect(result).toEqual(mockGetEventsResult);
		expect(resultWithTxIDPadded).toEqual(mockGetEventsResult);
		expect(resultWithTxIDPaddedWithCCMID).toEqual(mockGetEventsResult);
	});

	it('should throw a NotFoundException when an invalid blockID is provided', async () => {
		const mockInvalidBlockID = 'valid-block-id';

		const {
			Exceptions: { NotFoundException },
		} = require('lisk-service-framework');

		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				DB: {
					MySQL: {
						getTableInstance: jest.fn(schema => {
							if (schema.tableName === mockBlocksTableSchema.tableName) {
								return {
									find: jest.fn(params => {
										expect(params.id).toEqual(mockInvalidBlockID);
										return [];
									}),
								};
							}
							if (schema.tableName === mockEventsTableSchema.tableName) {
								return {
									find: jest.fn(() => mockEventsForEventTopics),
									count: jest.fn(() => 10),
								};
							}
							if (schema.tableName === mockEventTopicsTableSchema.tableName) {
								return {
									find: jest.fn(() => mockEventTopics),
									count: jest.fn(() => 10),
								};
							}
							throw new Error();
						}),
					},
				},
			};
		});

		const { getEvents } = require(mockEventsFilePath);
		await expect(
			getEvents({
				blockID: mockInvalidBlockID,
			}),
		).rejects.toThrow(NotFoundException);
	});

	it('should throw a NotFoundException for an invalid combination of blockID and height', async () => {
		const mockValidBlockID = 'valid-block-id';

		const {
			Exceptions: { NotFoundException },
		} = require('lisk-service-framework');

		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				DB: {
					MySQL: {
						getTableInstance: jest.fn(schema => {
							if (schema.tableName === mockBlocksTableSchema.tableName) {
								return {
									find: jest.fn(queryParams => {
										expect(queryParams.id).toEqual(mockValidBlockID);
										return [{ height: 123 }];
									}),
								};
							}
							if (schema.tableName === mockEventsTableSchema.tableName) {
								return {
									find: jest.fn(() => mockEventsForEventTopics),
									count: jest.fn(() => 10),
								};
							}
							if (schema.tableName === mockEventTopicsTableSchema.tableName) {
								return {
									find: jest.fn(() => mockEventTopics),
									count: jest.fn(() => 10),
								};
							}
							throw new Error();
						}),
					},
				},
			};
		});

		const { getEvents } = require(mockEventsFilePath);
		await expect(
			getEvents({
				blockID: mockValidBlockID,
				height: 456,
			}),
		).rejects.toThrow(NotFoundException);
	});
});
