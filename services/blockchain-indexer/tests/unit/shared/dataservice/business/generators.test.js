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

const mockValidatorUtilsPath = resolve(`${__dirname}/../../../../../shared/utils/validator`);
const mockRequestPath = resolve(`${__dirname}/../../../../../shared/utils/request`);
const mockedGeneratorsPath = resolve(
	`${__dirname}/../../../../../shared/dataService/business/generators`,
);
const mockedPosPath = resolve(`${__dirname}/../../../../../shared/dataService/business/pos`);

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
				getTableInstance: jest.fn(() => ({
					find: jest.fn(() => [
						{ publicKey: 'fe50ee28b084414499465ff823e7d651c9d19d75d33a82c44b2a15e3dc62bac9' },
					]),
				})),
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

describe('getGeneratorsInfo', () => {
	it('should return generators list', async () => {
		jest.mock(mockRequestPath, () => ({
			requestConnector: jest.fn(() => ({
				list: [
					{
						address: 'lsky2j2fnmhxushe5ywvdw4ouvxg8s4aeo4a7bpxb',
						nextAllocatedTime: 1699615180,
					},
				],
			})),
		}));

		jest.mock(mockValidatorUtilsPath, () => ({
			getNameByAddress: jest.fn(() => 'testGenerator_1'),
		}));

		const { getGeneratorsInfo } = require(mockedGeneratorsPath);
		const generators = await getGeneratorsInfo();
		const expectedResponse = [
			{
				address: 'lsky2j2fnmhxushe5ywvdw4ouvxg8s4aeo4a7bpxb',
				name: 'testGenerator_1',
				nextAllocatedTime: 1699615180,
				publicKey: 'fe50ee28b084414499465ff823e7d651c9d19d75d33a82c44b2a15e3dc62bac9',
			},
		];
		expect(generators.length).toBeGreaterThanOrEqual(1);
		expect(generators).toEqual(expectedResponse);
	});
});

describe('getNumberOfGenerators', () => {
	it('should return number of generators in one round', async () => {
		jest.mock(mockedPosPath, () => ({
			getPosConstants: jest.fn(() => ({
				data: {
					numberActiveValidators: 101,
					numberStandbyValidators: 2,
				},
			})),
		}));

		const { getNumberOfGenerators } = require(mockedGeneratorsPath);
		const numOfGenerators = await getNumberOfGenerators();
		expect(numOfGenerators).toBe(103);
	});
});
