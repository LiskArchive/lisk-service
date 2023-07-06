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

const mockedBlockID = '89a9f8dd0e9d15e54268f952b2e9430e799968169376273f715480d058a67dc4';
const mockedEvents = [{ id: 'c3a1f388859d69105241473ce9a49d831c8eb0043f717a626b2901f52ed3610c', name: 'transfer' }, { id: 'c3c120616d202a36e659248e6d384bbbf3429d4d56a6066f368aa14d16e81dfb', name: 'validatorRegistered' }];

const mockEventsFilePath = path.resolve(`${__dirname}/../../../../../shared/dataService/business/events`);
const mockConfigFilePath = path.resolve(`${__dirname}/../../../../../config`);

describe('getEventsByBlockID', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	it('should return events from cache if available', async () => {
		jest.mock(mockConfigFilePath, () => {
			const actual = jest.requireActual(mockConfigFilePath);
			return {
				...actual,
				isPersistEvents: true,
			};
		});

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

	it('should return events from DB and cache them if cache miss and isPersistEvents enabled', async () => {
		jest.mock(mockConfigFilePath, () => {
			const actual = jest.requireActual(mockConfigFilePath);
			return {
				...actual,
				isPersistEvents: true,
			};
		});

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
							return [
								{ eventStr: JSON.stringify({
									id: mockedEvents[0].id,
									name: mockedEvents[0].name }),
								},
								{ eventStr: JSON.stringify({
									id: mockedEvents[1].id,
									name: mockedEvents[1].name }),
								},
							];
						},
					}),
				},
			};
		});

		const { getEventsByBlockID } = require(mockEventsFilePath);
		const events = await getEventsByBlockID(mockedBlockID);
		expect(events).toEqual(mockedEvents);
	});

	it('should return an empty array if cache miss and isPersistEvents disabled', async () => {
		jest.mock(mockConfigFilePath, () => {
			const actual = jest.requireActual(mockConfigFilePath);
			return {
				...actual,
				isPersistEvents: false,
			};
		});

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
					getTableInstance: jest.fn(),
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

	it('Show throw error if cache throws error', async () => {
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
