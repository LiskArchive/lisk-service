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
import request from '../helpers/rpcApi';
import { JSON_RPC } from '../helpers/errorCodes';

const baseUrlRoot = config.SERVICE_ENDPOINT_RPC;
const baseUrl = `${baseUrlRoot}/rpc-test`;

const {
	INVALID_REQUEST,
	METHOD_NOT_FOUND,
	SERVER_ERROR,
} = JSON_RPC;

describe('Gateway', () => {
	it('provides basic RPC route', async () => {
		const response = await request(baseUrl, 'get.hello', {});

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

	it('client error returns 400 on wrong param name', async () => {
		const response = await request(baseUrl, 'get.hello', { wrong_param_name: 'user1' });
		expect(response).toEqual({
			code: INVALID_REQUEST[0],
			message: 'Unknown input parameter(s): wrong_param_name',
		});
	});

	it('client error returns 400 when no param value is defined', async () => {
		const response = await request(baseUrl, 'get.hello', { wrong_param_name: null });
		expect(response).toEqual({
			code: INVALID_REQUEST[0],
			message: 'Unknown input parameter(s): wrong_param_name',
		});
	});

	xit('client error returns 400 when param value is too short', async () => {
		const response = await request(baseUrl, 'get.hello', { path_name: 'ab' });
		expect(response).toEqual({
			code: INVALID_REQUEST[0],
			message: 'Invalid input parameter(s): wrong_param_name', // TODO: update
		});
	});

	it('server error returns 500', async () => {
		const response = await request(baseUrl, 'get.server_error', {});
		expect(response).toEqual({
			code: SERVER_ERROR[0],
			message: 'Server error: Called server.error',
		});
	});

	it('handles 404 error properly', async () => {
		const response = await request(baseUrl, 'get.wrong_path', {});
		expect(response).toEqual({
			code: METHOD_NOT_FOUND[0],
			message: 'Server error: Not found',
		});
	});
});
