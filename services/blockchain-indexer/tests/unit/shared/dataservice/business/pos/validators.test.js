const { rawValidators } = require('../../../constants/validators');

// Mocked dependencies
const { requestConnector } = require('../../../../../../shared/utils/request');

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
		const { getIndexedAccountInfo } = require('../../../../../../shared/dataService/utils/account');
		jest.mock('../../../../../../shared/dataService/utils/account');
		getIndexedAccountInfo.mockResolvedValueOnce({ publicKey: 'key1' })
			.mockResolvedValueOnce({ publicKey: 'key2' })
			.mockResolvedValueOnce({ publicKey: 'key3' });

		// Mock connector to respond with validators
		requestConnector.mockResolvedValueOnce({ validators: rawValidators });

		// Make a query to getAllPosValidators function
		const { getAllPosValidators } = require('../../../../../../shared/dataService/business/pos/validators');
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
		const { getIndexedAccountInfo } = require('../../../../../../shared/dataService/utils/account');
		jest.mock('../../../../../../shared/dataService/utils/account');
		getIndexedAccountInfo.mockResolvedValue({ publicKey: null });

		// Mock connector to respond with validators
		requestConnector.mockResolvedValueOnce({ validators: rawValidators });

		// Make a query to getAllPosValidators function
		const { getAllPosValidators } = require('../../../../../../shared/dataService/business/pos/validators');
		const result = await getAllPosValidators();

		// Expect output to include public keys fetched from getIndexedAccountInfo function
		expect(requestConnector).toHaveBeenCalledWith('getAllPosValidators');
		expect(result.length).toEqual(3);
		expect(result[0].validatorWeight).toEqual(BigInt('0'));
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
		const { getPosValidatorsByStake } = require('../../../../../../shared/dataService/business/pos/validators');
		const result = await getPosValidatorsByStake({ limit });

		// Expect output to include all validators
		expect(requestConnector).toHaveBeenCalledWith('getPosValidatorsByStake', { limit });
		expect(requestConnector).toHaveBeenCalledTimes(1);
		expect(result).toEqual(validatorsByStake);
	});
});
