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

const delay = require('lisk-service-framework/src/delay');
const { valid, invalid } = require('../../../constants/account');
const { transactions } = require('../../../constants/transaction');

const mockedRequestFilePath = resolve(`${__dirname}/../../../../shared/helpers/request`);
const mockedRequestAllFilePath = resolve(`${__dirname}/../../../../shared/helpers/requestAll`);

beforeEach(() => jest.resetModules());

describe('Account utils', () => {
	describe('Validate address', () => {
		it('returns true for valid Lisk32 address', async () => {
			const { validateLisk32Address } = require('../../../../shared/helpers/account');

			const isValid = validateLisk32Address(valid.address);
			expect(isValid).toBe(true);
		});

		it('returns false for invalid Lisk32 address', async () => {
			const { validateLisk32Address } = require('../../../../shared/helpers/account');

			const isInvalid = validateLisk32Address(invalid.address);
			expect(isInvalid).toBe(false);
		});
	});

	describe('Validate publicKey', () => {
		it('returns true for valid publicKey', async () => {
			const { validatePublicKey } = require('../../../../shared/helpers/account');

			const isValid = validatePublicKey(valid.publicKey);
			expect(isValid).toBe(true);
		});

		it('returns false for invalid publicKey', async () => {
			const { validatePublicKey } = require('../../../../shared/helpers/account');

			const isInvalid = validatePublicKey(invalid.publicKey);
			expect(isInvalid).toBe(false);
		});
	});

	describe('Extract address from a valid publicKey', () => {
		it('returns correct Lisk32 address from a valid publicKey', async () => {
			const { getLisk32AddressFromPublicKey } = require('../../../../shared/helpers/account');

			const address = getLisk32AddressFromPublicKey(valid.publicKey);
			expect(address).toBe(valid.address);
		});
	});

	describe('Test getAddressFromParams method', () => {
		const address = 'lskpg7qukha2nmu9483huwk8oty7q3pyevh3bohr4';
		const publicKey = '86cbecb2a176934e454f63e7ffa05783be6960d90002c5558dfd31397cd8f020';

		it('should return address from address in params', async () => {
			const { getAddressFromParams } = require('../../../../shared/helpers/account');

			const result = getAddressFromParams({ address });
			expect(result).toBe(address);
		});

		it('should return address from publicKey in params', async () => {
			const { getAddressFromParams } = require('../../../../shared/helpers/account');

			const result = getAddressFromParams({ publicKey });
			expect(result).toBe(address);
		});
	});

	describe('Test checkIfAccountExists method', () => {
		it('should return true when account exists', async () => {
			jest.mock(mockedRequestFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { requestIndexer } = require(mockedRequestFilePath);
			requestIndexer.mockResolvedValueOnce({
				data: { isExists: true },
				meta: {},
			});

			const { checkIfAccountExists } = require('../../../../shared/helpers/account');

			const isAccountExists = await checkIfAccountExists(
				'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			);
			expect(isAccountExists).toEqual(true);
		});
	});

	describe('Test checkIfAccountHasTransactions method', () => {
		it('should return true when account has transactions', async () => {
			jest.mock(mockedRequestFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { requestIndexer } = require(mockedRequestFilePath);
			requestIndexer.mockResolvedValueOnce({
				data: [transactions.tokenTransfer],
				meta: {},
			});

			const { checkIfAccountHasTransactions } = require('../../../../shared/helpers/account');

			const isAccountHasTransactions = await checkIfAccountHasTransactions(
				'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			);
			expect(isAccountHasTransactions).toEqual(true);
		});

		it('should return false when account has no transactions', async () => {
			jest.mock(mockedRequestFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { requestIndexer } = require(mockedRequestFilePath);
			requestIndexer.mockResolvedValueOnce({
				data: [],
				meta: {},
			});

			const { checkIfAccountHasTransactions } = require('../../../../shared/helpers/account');

			const isAccountHasTransactions = await checkIfAccountHasTransactions(
				'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			);
			expect(isAccountHasTransactions).toEqual(false);
		});
	});

	describe('Test checkIfAccountIsValidator method', () => {
		it('should return true when account is a validator', async () => {
			jest.mock(mockedRequestFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { requestIndexer } = require(mockedRequestFilePath);
			requestIndexer.mockResolvedValueOnce({
				data: [
					{
						name: 'twitter',
						totalStake: '0',
						selfStake: '0',
						validatorWeight: '0',
						address: 'lsk3j2dfuw4rsfsbcftwy838hd9vagmu2emype9do',
						publicKey: '750b2fa94026d29b8ef49d8e00ceb1b0d31107914e327d3c8f45d61b6afef370',
					},
				],
				meta: {},
			});

			const { checkIfAccountIsValidator } = require('../../../../shared/helpers/account');

			const isAccountValidator = await checkIfAccountIsValidator(
				'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			);
			expect(isAccountValidator).toEqual(true);
		});

		it('should return false when account is not a validator', async () => {
			jest.mock(mockedRequestFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { requestIndexer } = require(mockedRequestFilePath);
			requestIndexer.mockResolvedValueOnce({
				data: [],
				meta: {},
			});

			const { checkIfAccountIsValidator } = require('../../../../shared/helpers/account');

			const isAccountValidator = await checkIfAccountIsValidator(
				'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			);
			expect(isAccountValidator).toEqual(false);
		});
	});

	describe('Test getOpeningBalances method', () => {
		it('should return opening balances when called with valid address', async () => {
			const mockUserSubstore = [
				{
					address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
					availableBalance: '100000000000000',
					lockedBalances: [],
					tokenID: '0400000000000000',
				},
			];

			jest.mock(mockedRequestFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { requestConnector } = require(mockedRequestFilePath);
			requestConnector.mockResolvedValueOnce(undefined).mockResolvedValueOnce(mockUserSubstore);

			const { getOpeningBalances } = require('../../../../shared/helpers/account');

			const openingBalance = await getOpeningBalances('lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo');
			const expectedResponse = [
				{
					tokenID: '0400000000000000',
					amount: '100000000000000',
				},
			];

			expect(openingBalance).toEqual(expectedResponse);
		});

		it('should throw error when called with undefined', async () => {
			jest.mock(mockedRequestFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { requestConnector } = require(mockedRequestFilePath);
			requestConnector.mockResolvedValueOnce(undefined);

			const { getOpeningBalances } = require('../../../../shared/helpers/account');
			expect(getOpeningBalances(undefined)).rejects.toThrow();
		});
	});

	describe('Test getTokenBalancesAtGenesis method', () => {
		it('should return token balances at genesis', async () => {
			const mockUserSubstore = [
				{
					address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
					availableBalance: '100000000000000',
					lockedBalances: [],
					tokenID: '0400000000000000',
				},
			];

			jest.mock(mockedRequestFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { requestConnector } = require(mockedRequestFilePath);
			requestConnector.mockResolvedValueOnce({
				token: {
					userSubstore: 1,
				},
			});

			jest.mock(mockedRequestAllFilePath);
			// eslint-disable-next-line import/no-dynamic-require
			const { requestAllCustom } = require(mockedRequestAllFilePath);
			await requestAllCustom.mockReturnValue({ userSubstore: mockUserSubstore });

			const { getTokenBalancesAtGenesis } = require('../../../../shared/helpers/account');

			const tokenBalances1 = await getTokenBalancesAtGenesis();
			const expectedResponse1 = undefined;
			expect(tokenBalances1).toEqual(expectedResponse1);

			// Add delay to let the mock first resolve the async promise from requestConnector
			await delay(10);

			const tokenBalances2 = await getTokenBalancesAtGenesis();
			const expectedResponse2 = [
				{
					tokenID: '0400000000000000',
					address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
					availableBalance: '100000000000000',
					lockedBalances: [],
				},
			];

			expect(tokenBalances2).toEqual(expectedResponse2);
		});
	});
});
