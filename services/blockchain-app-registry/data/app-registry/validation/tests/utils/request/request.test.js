/*
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
 */
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const axios = require('axios');
const io = require('socket.io-client');

const mockRequestFilePath = path.resolve(`${__dirname}/../../../src/utils/request`);

jest.mock('axios');
jest.mock('socket.io-client');

const mockSSLCertificate = 'mock-certificate';
const mockPublicKey = 'mock-public-key';

jest.mock('../../../src/utils/request/certificate', () => ({
	getCertificateFromURL: jest.fn().mockResolvedValueOnce(mockSSLCertificate),
	convertCertificateToPemPublicKey: jest.fn().mockResolvedValueOnce(mockPublicKey),
}));

describe('wsRequest for ws requests', () => {
	const incorrectWsEndpoint = 'http://example.com';
	const wsEndpoint = 'ws://example.com';
	const wsMethod = 'exampleMethod';
	const wsParams = { exampleParam: 'value' };

	beforeEach(() => {
		io.mockReset();
	});

	it('should throw an error for an incorrect websocket URL protocol', async () => {
		const { wsRequest } = require(mockRequestFilePath);
		await expect(wsRequest(incorrectWsEndpoint, wsMethod, wsParams)).rejects.toThrow(
			`Incorrect websocket URL protocol: ${incorrectWsEndpoint}.`,
		);
		expect(io).not.toHaveBeenCalled();
	});

	it('should resolve with the response data when successful', async () => {
		const mockResponse = { result: { data: 'Mock response data' } };
		const mockSocket = {
			emit: jest.fn().mockImplementation((eventName, data, callback) => {
				callback(mockResponse);
			}),
			close: jest.fn(),
			on: jest.fn(),
		};

		io.mockReturnValueOnce(mockSocket);

		const { wsRequest } = require(mockRequestFilePath);
		const responseData = await wsRequest(wsEndpoint, wsMethod, wsParams);

		expect(responseData).toEqual(mockResponse);
		expect(io).toHaveBeenCalledWith(wsEndpoint, { forceNew: true, transports: ['websocket'] });
		expect(mockSocket.emit).toHaveBeenCalledWith('request', { method: wsMethod, params: wsParams }, expect.any(Function));
		expect(mockSocket.close).toHaveBeenCalled();
		expect(mockSocket.on).toHaveBeenCalled();
	});

	it('should reject with an error when an error event is received', async () => {
		const mockError = new Error('Mock error');
		const mockSocket = {
			emit: jest.fn(),
			close: jest.fn(),
			on: jest.fn().mockImplementation((eventName, callback) => {
				if (eventName === 'error') {
					callback(mockError);
				}
			}),
		};

		const { wsRequest } = require(mockRequestFilePath);
		io.mockReturnValueOnce(mockSocket);

		await expect(wsRequest(wsEndpoint, wsMethod, wsParams)).rejects.toThrow(mockError);
		expect(io).toHaveBeenCalledWith(wsEndpoint, { forceNew: true, transports: ['websocket'] });
		expect(mockSocket.emit).toHaveBeenCalledWith('request', { method: wsMethod, params: wsParams }, expect.any(Function));
		expect(mockSocket.close).toHaveBeenCalled();
		expect(mockSocket.on).toHaveBeenCalled();
	});
});

describe('httpRequest for http requests', () => {
	const url = 'http://example.com';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return the response when status code is 200', async () => {
		const mockResponse = {
			status: 200,
			data: 'Mock response data',
		};

		axios.get.mockResolvedValueOnce(mockResponse);

		const { httpRequest } = require(mockRequestFilePath);
		const response = await httpRequest(url, {});

		expect(response).toEqual(mockResponse);
		expect(axios.get).toHaveBeenCalledWith(url, {});
	});

	it('should throw an error when status code is not 200', async () => {
		const mockResponse = {
			status: 404,
			statusText: 'Not Found',
		};

		axios.get.mockResolvedValueOnce(mockResponse);

		const { httpRequest } = require(mockRequestFilePath);
		await expect(httpRequest(url, {})).rejects.toThrow(
			`URL '${url}' returned response with status code ${mockResponse.status}.`,
		);
		expect(axios.get).toHaveBeenCalledWith(url, {});
	});
});

describe('wsRequest for wss requests', () => {
	const wsEndpoint = 'wss://example.com';
	const invalidWsEndpoint = 'http://example.com';
	const wsMethod = 'exampleMethod';
	const wsParams = { exampleParam: 'value' };
	const mockCertificate = 'mock-certificate';
	const invalidPublicKey = 'invalid-public-key';
	const timeout = 5000;

	const mockResponse = { result: { data: 'Mock response data' } };

	beforeEach(() => {
		io.mockReset();
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('should reject with an error for an incorrect secured websocket URL protocol', async () => {
		const { wsRequest } = require(mockRequestFilePath);
		await expect(wsRequest(invalidWsEndpoint, wsMethod, wsParams, mockCertificate)).rejects.toThrow(
			`Incorrect websocket URL protocol: ${invalidWsEndpoint}.`,
		);
		expect(io).not.toHaveBeenCalled();
	});

	it('should resolve with the response data when successful and certificate matches', async () => {
		const mockSocket = {
			emit: jest.fn().mockImplementation((eventName, data, callback) => {
				callback(mockResponse);
			}),
			close: jest.fn(),
			on: jest.fn(),
		};

		const mockIo = require('socket.io-client');
		jest.mock('pemtools');
		jest.mock('socket.io-client');

		mockIo.mockReturnValueOnce(mockSocket);

		const { wsRequest } = require(mockRequestFilePath);
		const responseData = await wsRequest(wsEndpoint, wsMethod, wsParams, mockPublicKey, timeout);
		expect(responseData).toEqual(mockResponse);
	});

	it('should reject with an error when an error event is received', async () => {
		const mockError = new Error('Mock error');

		const mockSocket = {
			emit: jest.fn(),
			close: jest.fn(),
			on: jest.fn().mockImplementation((eventName, callback) => {
				if (eventName === 'error') {
					callback(mockError);
				}
			}),
		};

		const mockIo = require('socket.io-client');
		jest.mock('socket.io-client');

		mockIo.mockReturnValueOnce(mockSocket);

		const { wsRequest } = require(mockRequestFilePath);
		io.mockReturnValueOnce(mockSocket);

		await expect(wsRequest(wsEndpoint, wsMethod, wsParams, mockCertificate, timeout)).rejects.toThrow(mockError);
	});

	it('should reject with an error when the certificate does not match', async () => {
		const mockSocket = {
			emit: jest.fn().mockImplementation((eventName, data, callback) => {
				callback(mockResponse);
			}),
			close: jest.fn(),
			on: jest.fn(),
		};

		const mockIo = require('socket.io-client');
		jest.mock('socket.io-client');

		mockIo.mockReturnValueOnce(mockSocket);

		const { wsRequest } = require(mockRequestFilePath);
		await expect(wsRequest(wsEndpoint, wsMethod, wsParams, invalidPublicKey, timeout)).rejects.toThrow(
			"Supplied apiCertificatePublickey doesn't match with public key extracted from the SSL/TLS security certificate.",
		);
	});
});

describe('httpRequest for https requests', () => {
	const url = 'https://example.com';
	const invalidUrl = 'wss://example.com';
	const certificate = 'mock-certificate';
	const invalidPublicKey = 'invalid-public-key';

	const mockResponse = {
		status: 200,
		data: 'Mock response data',
	};

	const mockInvalidResponse = {
		status: 404,
		statusText: 'Not Found',
	};

	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('should throw an error for an unsecured service URL', async () => {
		const { httpRequest } = require(mockRequestFilePath);
		await expect(httpRequest(invalidUrl, {}, certificate)).rejects.toThrow(
			`Incorrect service URL provided: ${invalidUrl}.`,
		);
		expect(axios.get).not.toHaveBeenCalled();
	});

	it('should return the response and validate the certificate', async () => {
		const mockAxios = require('axios');
		jest.mock('axios');

		mockAxios.get.mockResolvedValueOnce(mockResponse);

		const { httpRequest } = require(mockRequestFilePath);
		const response = await httpRequest(url, {}, mockPublicKey);

		expect(response).toEqual(mockResponse);
	});

	it('should throw an error when the response status code is not 200', async () => {
		const mockAxios = require('axios');
		jest.mock('axios');

		mockAxios.get.mockResolvedValueOnce(mockInvalidResponse);

		const { httpRequest } = require(mockRequestFilePath);
		await expect(httpRequest(url, {}, certificate)).rejects.toThrow(
			`URL '${url}' returned response with status code ${mockInvalidResponse.status}.`,
		);
	});

	it('should throw an error when the certificate does not match', async () => {
		const mockAxios = require('axios');
		jest.mock('axios');

		mockAxios.get.mockResolvedValueOnce(mockResponse);

		const { httpRequest } = require(mockRequestFilePath);
		await expect(httpRequest(url, {}, invalidPublicKey)).rejects.toThrow(
			"Supplied apiCertificatePublickey doesn't match with public key extracted from the SSL/TLS security certificate.",
		);
	});
});
