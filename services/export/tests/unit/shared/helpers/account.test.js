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

const {
	validateLisk32Address,
	validatePublicKey,
	getLisk32AddressFromPublicKey,
	getAddressFromParams,
} = require('../../../../shared/helpers/account');

const { valid, invalid } = require('../../../constants/account');

const mockedRequestFilePath = resolve(`${__dirname}/../../../../shared/helpers/request`);

describe('Account utils', () => {
	describe('Validate address', () => {
		it('returns true for valid Lisk32 address', async () => {
			const isValid = validateLisk32Address(valid.address);
			expect(isValid).toBe(true);
		});

		it('returns false for invalid Lisk32 address', async () => {
			const isInvalid = validateLisk32Address(invalid.address);
			expect(isInvalid).toBe(false);
		});
	});

	describe('Validate publicKey', () => {
		it('returns true for valid publicKey', async () => {
			const isValid = validatePublicKey(valid.publicKey);
			expect(isValid).toBe(true);
		});

		it('returns false for invalid publicKey', async () => {
			const isInvalid = validatePublicKey(invalid.publicKey);
			expect(isInvalid).toBe(false);
		});
	});

	describe('Extract address from a valid publicKey', () => {
		it('returns correct Lisk32 address from a valid publicKey', async () => {
			const address = getLisk32AddressFromPublicKey(valid.publicKey);
			expect(address).toBe(valid.address);
		});
	});

	describe('Test getAddressFromParams method', () => {
		const address = 'lskpg7qukha2nmu9483huwk8oty7q3pyevh3bohr4';
		const publicKey = '86cbecb2a176934e454f63e7ffa05783be6960d90002c5558dfd31397cd8f020';

		it('should return address from address in params', async () => {
			const result = getAddressFromParams({ address });
			expect(result).toBe(address);
		});

		it('should return address from publicKey in params', async () => {
			const result = getAddressFromParams({ publicKey });
			expect(result).toBe(address);
		});
	});

	describe('Test checkIfAccountExists method', () => {
		it('should return true when account exists', async () => {
			jest.mock(mockedRequestFilePath, () => {
				const actual = jest.requireActual(mockedRequestFilePath);
				return {
					...actual,
					requestIndexer() {
						return {
							data: { isExists: true },
							meta: {},
						};
					},
				};
			});

			const { checkIfAccountExists } = require('../../../../shared/helpers/account');

			const isAccountExists = await checkIfAccountExists(
				'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			);
			expect(isAccountExists).toEqual(true);
		});
	});

	describe('Test getOpeningBalance method', () => {
		it('should return opening balance when called with valid address', async () => {
			const mockUserSubstore = {
				address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
				availableBalance: '100000000000000',
				lockedBalances: [],
				tokenID: '0400000000000000',
			};

			jest.mock(mockedRequestFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { requestConnector } = require(mockedRequestFilePath);
			requestConnector.mockResolvedValueOnce(undefined).mockResolvedValueOnce(mockUserSubstore);

			const { getOpeningBalance } = require('../../../../shared/helpers/account');

			const openingBalance = await getOpeningBalance('lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo');
			const expectedResponse = {
				tokenID: '0400000000000000',
				amount: '100000000000000',
			};

			expect(openingBalance).toEqual(expectedResponse);
		});

		it('should throw error when called with undefined', async () => {
			jest.mock(mockedRequestFilePath, () => {
				const actual = jest.requireActual(mockedRequestFilePath);
				return {
					...actual,
					requestConnector() {
						return undefined;
					},
				};
			});

			const { getOpeningBalance } = require('../../../../shared/helpers/account');
			expect(getOpeningBalance(undefined)).rejects.toThrow();
		});
	});
});
