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

const { rawValidators } = require('../../../constants/validators');
const { requestConnector } = require('../../../../../../shared/utils/request');

const mockAccountPath = resolve(`${__dirname}/../../../../../../shared/dataService/utils/account`);
const validatorsPath = resolve(`${__dirname}/../../../../../../shared/dataService/business/pos/validators`);

// Mock dependencies
jest.mock('../../../../../../shared/utils/request', () => ({
	requestConnector: jest.fn(),
}));

jest.mock('lisk-service-framework', () => ({
	CacheRedis: jest.fn(() => ({
		set: jest.fn(),
		get: jest.fn(),
	})),
	cacheLRU: jest.fn(),
	Exceptions: {
		NotFoundException: jest.fn(),
	},
	Logger: jest.fn(() => ({
		debug: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
	})),
	MySQL: {
		getTableInstance: jest.fn(),
	},
}));

describe('getAllPosValidators', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return all validators with correct validatorWeight when not banned or punished', async () => {
		// Mock getIndexedAccountInfo function to return
		jest.mock(mockAccountPath);
		const { getIndexedAccountInfo } = require(mockAccountPath);
		getIndexedAccountInfo.mockResolvedValueOnce({ publicKey: 'key1' })
			.mockResolvedValueOnce({ publicKey: 'key2' })
			.mockResolvedValueOnce({ publicKey: 'key3' });

		// Mock connector to respond with validators
		requestConnector.mockResolvedValueOnce({ validators: rawValidators });

		// Make a query to getAllPosValidators function
		const { getAllPosValidators } = require(validatorsPath);
		const result = await getAllPosValidators();

		// Expect getIndexedAccountInfo to have been called 3 times with different addresses
		expect(getIndexedAccountInfo).toHaveBeenCalledWith({ address: rawValidators[0].address }, ['publicKey']);
		expect(getIndexedAccountInfo).toHaveBeenCalledWith({ address: rawValidators[1].address }, ['publicKey']);
		expect(getIndexedAccountInfo).toHaveBeenCalledWith({ address: rawValidators[2].address }, ['publicKey']);
		expect(getIndexedAccountInfo).toHaveBeenCalledTimes(3);

		// Expect output to include public keys fetched from getIndexedAccountInfo function
		rawValidators[0].publicKey = 'key1';
		rawValidators[1].publicKey = 'key2';
		rawValidators[2].publicKey = 'key3';
		expect(result).toEqual(rawValidators);
	});

	it('should return all validators with validatorWeight set to 0 when banned or punished', async () => {
		// Ban first validator
		rawValidators[0].isBanned = true;

		// Mock getIndexedAccountInfo function to return
		jest.mock(mockAccountPath);
		const { getIndexedAccountInfo } = require(mockAccountPath);
		getIndexedAccountInfo.mockResolvedValue({ publicKey: null });

		// Mock connector to respond with validators
		requestConnector.mockResolvedValueOnce({ validators: rawValidators });

		// Make a query to getAllPosValidators function
		const { getAllPosValidators } = require(validatorsPath);
		const result = await getAllPosValidators();

		// Expect output to include public keys fetched from getIndexedAccountInfo function
		expect(requestConnector).toHaveBeenCalledWith('getAllPosValidators');
		expect(result.length).toEqual(3);
		expect(result[0].validatorWeight).toEqual(BigInt('0'));
	});

	it('should return an empty array when no validators found', async () => {
		// Mock connector to respond with validators
		requestConnector.mockResolvedValue({ validators: [] });

		// Make a query to getAllPosValidators function
		const { getAllPosValidators } = require(validatorsPath);
		const result = await getAllPosValidators();

		// Assert the result
		expect(requestConnector).toHaveBeenCalledWith('getAllPosValidators');
		expect(requestConnector).toHaveBeenCalledTimes(1);
		expect(result).toEqual([]);
	});

	it('should handle error when requestConnector throws an error', async () => {
		// Mock connector to respond with a error
		const errorMessage = 'Request failed';
		requestConnector.mockRejectedValue(new Error(errorMessage));

		// Make a query to getAllPosValidators function and expect it to fail
		const { getAllPosValidators } = require(validatorsPath);
		await expect(getAllPosValidators()).rejects.toThrow(errorMessage);

		// Assert the result
		expect(requestConnector).toHaveBeenCalledWith('getAllPosValidators');
		expect(requestConnector).toHaveBeenCalledTimes(1);
	});
});

describe('getPosValidators', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return validators with correct validatorWeight when not banned or punished', async () => {
		const validators = rawValidators;

		// Mock connector to respond with validators
		requestConnector.mockReturnValueOnce(validators[0])
			.mockReturnValueOnce(validators[1])
			.mockReturnValueOnce(validators[2]);

		// Make a query to getAllPosValidators function
		const { getPosValidators } = require(validatorsPath);
		const params = { addresses: [validators[0].address, validators[1].address,
			validators[2].address] };
		const result = await getPosValidators(params);

		// Assert the result
		expect(requestConnector).toHaveBeenCalledWith('getPosValidator', { address: validators[0].address });
		expect(requestConnector).toHaveBeenCalledWith('getPosValidator', { address: validators[1].address });
		expect(requestConnector).toHaveBeenCalledWith('getPosValidator', { address: validators[2].address });
		expect(requestConnector).toHaveBeenCalledTimes(3);
		expect(result).toEqual(validators);
	});

	it('should return validators with validatorWeight set to 0 when banned or punished', async () => {
		const validators = rawValidators;
		validators[0].isBanned = true;

		// Mock connector to respond with validators
		requestConnector.mockReturnValueOnce(validators[0])
			.mockReturnValueOnce(validators[1])
			.mockReturnValueOnce(validators[2]);

		// Make a query to getAllPosValidators function
		const { getPosValidators } = require(validatorsPath);
		const params = { addresses: [validators[0].address, validators[1].address,
			validators[2].address] };
		const result = await getPosValidators(params);

		// Assert the result
		expect(requestConnector).toHaveBeenCalledWith('getPosValidator', { address: validators[0].address });
		expect(requestConnector).toHaveBeenCalledWith('getPosValidator', { address: validators[1].address });
		expect(requestConnector).toHaveBeenCalledWith('getPosValidator', { address: validators[2].address });
		expect(requestConnector).toHaveBeenCalledTimes(3);

		expect(result.length).toEqual(3);
		expect(result[0].validatorWeight).toEqual(BigInt('0'));
		expect(result).toEqual(validators);
	});

	it('should handle error when requestConnector throws an error', async () => {
		const params = { address: 'validator-address' };
		const errorMessage = 'Request failed';

		// Mock connector to respond with validators
		requestConnector.mockRejectedValue(new Error(errorMessage));

		// Make a query to getPosValidators function and expect it to throw
		const { getPosValidators } = require(validatorsPath);
		await expect(getPosValidators(params)).rejects.toThrow(errorMessage);

		// Assert the result
		expect(requestConnector).toHaveBeenCalledWith('getPosValidator', { address: 'validator-address' });
		expect(requestConnector).toHaveBeenCalledTimes(1);
	});
});

describe('getPosValidatorsByStake', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return validators by stake', async () => {
		const limit = 10;

		// Mock connector to respond with validators
		const validatorsByStake = rawValidators;
		requestConnector.mockResolvedValue({ validators: validatorsByStake });

		// Make a query to getPosValidatorsByStake function
		const { getPosValidatorsByStake } = require(validatorsPath);
		const result = await getPosValidatorsByStake({ limit });

		// Expect output to include all validators
		expect(requestConnector).toHaveBeenCalledWith('getPosValidatorsByStake', { limit });
		expect(requestConnector).toHaveBeenCalledTimes(1);
		expect(result).toEqual(validatorsByStake);
	});

	it('should return an empty array when no validators found', async () => {
		const limit = 10;

		// Mock connector to respond with validators
		requestConnector.mockResolvedValue({ validators: [] });

		// Make a query to getPosValidatorsByStake function
		const { getPosValidatorsByStake } = require(validatorsPath);
		const params = { limit };
		const result = await getPosValidatorsByStake(params);

		// Expect output to include empty array
		expect(requestConnector).toHaveBeenCalledWith('getPosValidatorsByStake', { limit });
		expect(requestConnector).toHaveBeenCalledTimes(1);
		expect(result).toEqual([]);
	});

	it('should handle error when requestConnector throws an error', async () => {
		const limit = 10;
		const errorMessage = 'Request failed';

		// Mock connector to respond with error
		requestConnector.mockRejectedValue(new Error(errorMessage));

		// Make a query to getPosValidatorsByStake function
		const { getPosValidatorsByStake } = require(validatorsPath);
		const params = { limit };
		await expect(getPosValidatorsByStake(params)).rejects.toThrow(errorMessage);

		// Assert the result
		expect(requestConnector).toHaveBeenCalledWith('getPosValidatorsByStake', { limit });
		expect(requestConnector).toHaveBeenCalledTimes(1);
	});
});
