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
const config = require('../../config');
const { api } = require('../../helpers/api');

const baseUrlRoot = config.SERVICE_ENDPOINT_HTTP;
const baseUrl = `${baseUrlRoot}/api/test`;

describe('Gateway', () => {
	it('provides basic HTTP route', async () => {
		const response = await api.get(`${baseUrl}/hello`);
		expect(response).toEqual({
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

	it('provides HTTP route with parameters', async () => {
		const response = await api.get(`${baseUrl}/hello/user1`);
		expect(response).toEqual({
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
		const expectedStatus = 400;
		const response = await api.get(`${baseUrl}/hello/user1?wrong_param_name=some_value`, expectedStatus);
		expect(response).toEqual({
			error: true,
			message: 'Unknown input parameter(s): wrong_param_name',
		});
	});

	it('client error returns 400 when no param value is defined', async () => {
		const expectedStatus = 400;
		const response = await api.get(`${baseUrl}/hello/user1?wrong_param_name=`, expectedStatus);
		expect(response).toEqual({
			error: true,
			message: 'Unknown input parameter(s): wrong_param_name',
		});
	});

	it('client error returns 400 when param value is too short', async () => {
		const expectedStatus = 400;
		const response = await api.get(`${baseUrl}/hello/ab`, expectedStatus);
		expect(response).toEqual({
			error: true,
			message: 'Invalid input: The \'path_name\' field length must be greater than or equal to 3 characters long.',
		});
	});

	it('server error returns 500', async () => {
		const expectedStatus = 500;
		const response = await api.get(`${baseUrl}/server_error`, expectedStatus);
		expect(response).toEqual({
			error: true,
			message: 'Server error: Called server.error',
		});
	});

	it('handles 404 error properly', async () => {
		const expectedStatus = 404;
		const response = await api.get(`${baseUrl}/wrong_path`, expectedStatus);
		expect(response).toEqual({
			error: true,
			message: 'Server error: Not found',
		});
	});
});
