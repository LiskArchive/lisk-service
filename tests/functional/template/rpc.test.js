/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
import config from '../config';
import { JSON_RPC } from '../../helpers/errorCodes';

const { request } = require('../../helpers/socketIoRpcRequest');

const baseUrlRoot = config.SERVICE_ENDPOINT_RPC;
const baseUrl = `${baseUrlRoot}/rpc-test`;

const {
	INVALID_PARAMS,
	METHOD_NOT_FOUND,
	SERVER_ERROR,
} = JSON_RPC;

describe('Gateway', () => {
	it('provides basic RPC route', async () => {
		const response = await request(baseUrl, 'get.hello', {});
		expect(response.jsonrpc).toEqual('2.0');
		expect(response.id).toEqual(1);
		expect(response.result).toEqual({
			data: [
				{
					message: 'Hello World!',
				},
			],
			links: {},
			meta: {
				count: 1,
			},
		});
	});

	it('provides RPC route with parameters', async () => {
		const response = await request(baseUrl, 'get.hello.param', { path_name: 'user1' });
		expect(response.jsonrpc).toEqual('2.0');
		expect(response.id).toEqual(1);
		expect(response.result).toEqual({
			data: [
				{
					message: 'Hello World!',
					name: 'user1',
				},
			],
			links: {},
			meta: {
				count: 1,
			},
		});
	});

	it('client error returns INVALID_REQUEST on wrong param name', async () => {
		await expect(request(baseUrl, 'get.hello', { wrong_param_name: 'user1' })).rejects.toStrictEqual({
			jsonrpc: '2.0',
			id: 1,
			error: {
				code: INVALID_PARAMS[0],
				message: 'Unknown input parameter(s): wrong_param_name',
			},
		});
	});

	it('client error returns INVALID_REQUEST when no param value is defined', async () => {
		await expect(request(baseUrl, 'get.hello', { wrong_param_name: null })).rejects.toStrictEqual({
			jsonrpc: '2.0',
			id: 1,
			error: {
				code: INVALID_PARAMS[0],
				message: 'Unknown input parameter(s): wrong_param_name',
			},
		});
	});

	it('client error returns INVALID_REQUEST when param value is too short', async () => {
		await expect(request(baseUrl, 'get.hello', { path_name: 'ab' })).rejects.toStrictEqual({
			jsonrpc: '2.0',
			id: 1,
			error: {
				code: INVALID_PARAMS[0],
				message: 'Unknown input parameter(s): path_name',
			},
		});
	});

	it('server error returns SERVER_ERROR', async () => {
		await expect(request(baseUrl, 'get.server_error', {})).rejects.toStrictEqual({
			jsonrpc: '2.0',
			id: 1,
			error: {
				code: SERVER_ERROR[0],
				message: 'Server error: Called server.error',
			},
		});
	});

	it('handles METHOD_NOT_FOUND error properly', async () => {
		await expect(request(baseUrl, 'get.wrong_path', {})).rejects.toStrictEqual({
			jsonrpc: '2.0',
			id: 1,
			error: {
				code: METHOD_NOT_FOUND[0],
				message: 'Service \'get.wrong_path\' is not found.',
			},
		});
	});
});
