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
				MySQL: {
					getTableInstance: jest.fn(),
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
				MySQL: {
					getTableInstance: () => ({
						find: (params) => {
							expect(params).toEqual({ blockID: mockedBlockID });
							return [];
						},
					}),
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
				MySQL: {
					getTableInstance: jest.fn(),
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
				MySQL: {
					getTableInstance: jest.fn(),
				},
			};
		});

		const { cacheEventsByBlockID } = require(mockEventsFilePath);
		expect(() => cacheEventsByBlockID(mockedBlockID, mockedEvents)).rejects.toThrow();
	});
});
