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
const { resolve } = require('path');

const mockRequestPath = resolve(`${__dirname}/../../../../../../shared/utils/request`);
const dataServicePath = resolve(`${__dirname}/../../../../../../shared/dataService`);

beforeEach(() => {
	jest.resetModules();
	jest.clearAllMocks();
});

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
		DB: {
			MySQL: {
				getTableInstance: jest.fn(),
				KVStore: {
					...actual.DB.MySQL.KVStore,
					configureKeyValueTable: jest.fn(),
					getKeyValueTable: jest.fn(),
				},
			},
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
	};
});

describe('getLegacyAccountInfo', () => {
	const publicKey = 'fe50ee28b084414499465ff823e7d651c9d19d75d33a82c44b2a15e3dc62bac9';

	it('should return legacy account info', async () => {
		jest.mock(mockRequestPath, () => ({
			requestConnector: jest.fn(() => ({
				balance: 100000000000,
			})),
		}));

		const { getLegacyAccountInfo } = require(dataServicePath);
		const legacyAccountInfo = await getLegacyAccountInfo({ publicKey });
		const expectedResponse = {
			data: {
				balance: 100000000000,
				legacyAddress: '4823075312309157000L',
			},
			meta: {
				address: 'lskyvfv3esyznwkpxcp4u7rnsoqwv55y82vw4yh7b',
				publicKey: 'fe50ee28b084414499465ff823e7d651c9d19d75d33a82c44b2a15e3dc62bac9',
			},
		};
		expect(legacyAccountInfo).toEqual(expectedResponse);
	});
});
