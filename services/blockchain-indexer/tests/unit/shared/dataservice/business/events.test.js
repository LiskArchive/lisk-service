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

const mockEventsFilePath = path.resolve(`${__dirname}/../../../../../shared/dataService/business/events`);

const mockBlocksTableSchema = require('../../../../../shared/database/schema/blocks');
const mockEventsTableSchema = require('../../../../../shared/database/schema/events');
const mockEventTopicsTableSchema = require('../../../../../shared/database/schema/eventTopics');
const { mockEventTopics, mockEventsForEventTopics, getEventsResult } = require('../../constants/events');

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
					get: (key) => {
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
					get: (key) => {
						expect(key).toEqual(mockedBlockID);
						return undefined;
					},
					set: jest.fn(),
				})),
				DB: {
					MySQL: {
						getTableInstance: () => ({
							find: (params) => {
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
					get: (key) => {
						expect(key).toEqual(mockedBlockID);
						return undefined;
					},
					set: jest.fn(),
				})),
				DB: {
					MySQL: {
						getTableInstance: () => ({
							find: (params) => {
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
						getTableInstance: jest.fn((schema) => {
							if (schema.tableName === mockBlocksTableSchema.tableName) {
								return {
									find: jest.fn(() => []),
								};
							} if (schema.tableName === mockEventsTableSchema.tableName) {
								return {
									find: jest.fn(() => mockEventsForEventTopics),
									count: jest.fn(() => 10),
								};
							} if (schema.tableName === mockEventTopicsTableSchema.tableName) {
								return {
									find: jest.fn(() => mockEventsForEventTopics),
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
			sort: 'timestamp:desc',
			order: 'index:asc',
			limit: 10,
			offset: 0,
		};

		const { getEvents } = require(mockEventsFilePath);
		const result = await getEvents(params);

		expect(result).toEqual(getEventsResult);
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
						getTableInstance: jest.fn((schema) => {
							if (schema.tableName === mockBlocksTableSchema.tableName) {
								return {
									find: jest.fn((params) => {
										expect(params.id).toEqual(mockInvalidBlockID);
										return [];
									}),
								};
							} if (schema.tableName === mockEventsTableSchema.tableName) {
								return {
									find: jest.fn(() => mockEventsForEventTopics),
									count: jest.fn(() => 10),
								};
							} if (schema.tableName === mockEventTopicsTableSchema.tableName) {
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
		await expect(getEvents({
			blockID: mockInvalidBlockID,
		})).rejects.toThrow(NotFoundException);
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
						getTableInstance: jest.fn((schema) => {
							if (schema.tableName === mockBlocksTableSchema.tableName) {
								return {
									find: jest.fn((queryParams) => {
										expect(queryParams.id).toEqual(mockValidBlockID);
										return [{ height: 123 }];
									}),
								};
							} if (schema.tableName === mockEventsTableSchema.tableName) {
								return {
									find: jest.fn(() => mockEventsForEventTopics),
									count: jest.fn(() => 10),
								};
							} if (schema.tableName === mockEventTopicsTableSchema.tableName) {
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
		await expect(getEvents({
			blockID: mockValidBlockID,
			height: 456,
		})).rejects.toThrow(NotFoundException);
	});
});
