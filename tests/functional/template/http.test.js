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
import api from '../helpers/api';

const baseUrlRoot = config.SERVICE_ENDPOINT;
const baseUrl = `${baseUrlRoot}/api/test`;

const badRequestSchema = {
	errors: 'array',
	message: 'string',
};

const notFoundSchema = {
	error: 'boolean',
	message: 'string',
};


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

	xit('client error returns 400', async () => {
		const expectedStatus = 400;
		const response = await api.get(`${baseUrl}/client_error`, expectedStatus);
		expect(response).toEqual(badRequestSchema);
	});

	xit('server error returns 500', async () => {
		const expectedStatus = 500;
		const response = await api.get(`${baseUrl}/client_error`, expectedStatus);
		expect(response).toEqual({});
	});

	xit('handles 404 error properly', async () => {
		const expectedStatus = 400;
		const response = await api.get(`${baseUrl}/client_error`, expectedStatus);
		expect(response).toEqual({});
		expect(response).resolves.toMapRequiredSchema(notFoundSchema);
	});
});
