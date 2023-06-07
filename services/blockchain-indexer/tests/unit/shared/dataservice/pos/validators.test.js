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

const posValidatorsPath = path.resolve(`${__dirname}/../../../../../shared/dataService/pos/validators`);

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
		MySQL: {
			...actual.MySQL,
			getTableInstance: () => ({
				upsert: jest.fn(),
			}),
			KVStore: {
				...actual.MySQL.KVStore,
				configureKeyValueTable: jest.fn(),
				getKeyValueTable: jest.fn(),
			},
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
		Signals: {
			get: () => ({ add: jest.fn() }),
		},
	};
});

describe('Test isIncludePendingTransactions method', () => {
	it('should return less than 0 when first validator has more weight than second validator', async () => {
		const { validatorComparator } = require(posValidatorsPath);
		const result = validatorComparator(
			{ validatorWeight: BigInt(1e20) },
			{ validatorWeight: BigInt(1) },
		);
		expect(result).toBeLessThan(0);
	});

	it('should return greater than 0 when first validator has more weight than second validator', async () => {
		const { validatorComparator } = require(posValidatorsPath);
		const result = validatorComparator(
			{ validatorWeight: BigInt(1) },
			{ validatorWeight: BigInt(1e20) },
		);
		expect(result).toBeGreaterThan(0);
	});

	it('should return -1 when validator weight is same but first address is smaller', async () => {
		const { validatorComparator } = require(posValidatorsPath);
		const result = validatorComparator(
			{ validatorWeight: BigInt(1e20), hexAddress: '002e84247fd3876baca6698d98f0ace199af96ed' },
			{ validatorWeight: BigInt(1e20), hexAddress: '0282ed03925a5c31271fa3b70bb94ce12fd83ea9' },
		);
		expect(result).toBe(-1);
	});

	it('should return 1 when validator weight is same but first address is greater', async () => {
		const { validatorComparator } = require(posValidatorsPath);
		const result = validatorComparator(
			{ validatorWeight: BigInt(1e20), hexAddress: '0282ed03925a5c31271fa3b70bb94ce12fd83ea9' },
			{ validatorWeight: BigInt(1e20), hexAddress: '002e84247fd3876baca6698d98f0ace199af96ed' },
		);
		expect(result).toBe(1);
	});

	it('should return 0 when both validator weight and address are equal', async () => {
		const { validatorComparator } = require(posValidatorsPath);
		const result = validatorComparator(
			{ validatorWeight: BigInt(1e20), hexAddress: '0282ed03925a5c31271fa3b70bb94ce12fd83ea9' },
			{ validatorWeight: BigInt(1e20), hexAddress: '0282ed03925a5c31271fa3b70bb94ce12fd83ea9' },
		);
		expect(result).toBe(0);
	});
});
