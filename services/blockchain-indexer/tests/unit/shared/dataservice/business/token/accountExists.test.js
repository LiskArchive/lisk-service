/*
 * LiskHQ/lisk-service
 * Copyright © 2024 Lisk Foundation
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

const mockRequestFilePath = resolve(`${__dirname}/../../../../../../shared/utils/request`);
const mockTokenAvailableIDsFilePath = resolve(
	`${__dirname}/../../../../../../shared/dataService/business/token/availableIDs`,
);
const mockTokenaccountExistsFilePath = resolve(
	`${__dirname}/../../../../../../shared/dataService/business/token/accountExists`,
);
const mockValidatorUtilsPath = resolve(
	`${__dirname}/../../../../../../shared/dataService/utils/validator`,
);

beforeEach(() => jest.resetModules());

jest.mock('lisk-service-framework', () => {
	const actual = jest.requireActual('lisk-service-framework');
	return {
		...actual,
		DB: {
			...actual.DB,
			MySQL: {
				...actual.DB.MySQL,
				KVStore: {
					...actual.DB.MySQL.KVStore,
					getKeyValueTable: jest.fn(),
				},
			},
		},
		CacheRedis: jest.fn(),
		CacheLRU: jest.fn(),
	};
});

describe('tokenHasUserAccount', () => {
	const tokenID = '0000000000000000';
	const accAddressExists = 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo';
	const accAddressNotExists = 'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk';
	const name = 'testAccount';
	const publicKey = '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c';

	describe('should return isExists true when user account exists', () => {
		it('when called with tokenID and address', async () => {
			jest.mock(mockRequestFilePath, () => ({
				requestConnector: jest.fn(() => ({ exists: true })),
			}));

			// Make a query to tokenHasUserAccount function
			const { tokenHasUserAccount } = require(mockTokenaccountExistsFilePath);
			const result = await tokenHasUserAccount({ address: accAddressExists, tokenID });

			expect(result).toEqual({
				data: {
					isExists: true,
				},
				meta: {},
			});
		});

		it('when called with tokenID and publicKey', async () => {
			jest.mock(mockRequestFilePath, () => ({
				requestConnector: jest.fn(() => ({ exists: true })),
			}));

			// Make a query to tokenHasUserAccount function
			const { tokenHasUserAccount } = require(mockTokenaccountExistsFilePath);
			const result = await tokenHasUserAccount({ publicKey, tokenID });
			expect(result).toEqual({
				data: {
					isExists: true,
				},
				meta: {},
			});
		});

		it('when called with tokenID and name', async () => {
			jest.mock(mockRequestFilePath, () => ({
				requestConnector: jest.fn(() => ({ exists: true })),
			}));

			jest.mock(mockValidatorUtilsPath);
			const { getAddressByName } = require(mockValidatorUtilsPath);
			getAddressByName.mockReturnValueOnce(accAddressExists);

			// Make a query to tokenHasUserAccount function
			const { tokenHasUserAccount } = require(mockTokenaccountExistsFilePath);
			const result = await tokenHasUserAccount({ name, tokenID });
			expect(result).toEqual({
				data: {
					isExists: true,
				},
				meta: {},
			});
		});

		it('when called with address', async () => {
			jest.mock(mockRequestFilePath, () => ({
				requestConnector: jest.fn(() => ({ exists: true })),
			}));

			jest.mock(mockTokenAvailableIDsFilePath);
			const { getAvailableTokenIDs } = require(mockTokenAvailableIDsFilePath);
			getAvailableTokenIDs.mockReturnValueOnce({
				data: { tokenIDs: ['0000000000000000'] },
				meta: {},
			});

			// Make a query to tokenHasUserAccount function
			const { tokenHasUserAccount } = require(mockTokenaccountExistsFilePath);
			const result = await tokenHasUserAccount({ address: accAddressExists });

			expect(result).toEqual({
				data: {
					isExists: true,
				},
				meta: {},
			});
		});
	});

	describe('should return isExists false when user account does not exists', () => {
		it('when called with tokenID and address', async () => {
			jest.mock(mockRequestFilePath, () => ({
				requestConnector: jest.fn(() => ({ exists: false })),
			}));

			// Make a query to tokenHasUserAccount function
			const { tokenHasUserAccount } = require(mockTokenaccountExistsFilePath);
			const result = await tokenHasUserAccount({ address: accAddressNotExists, tokenID });

			expect(result).toEqual({
				data: {
					isExists: false,
				},
				meta: {},
			});
		});
	});
});
