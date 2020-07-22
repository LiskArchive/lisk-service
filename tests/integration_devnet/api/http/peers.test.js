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
import api from '../../helpers/api';
import config from '../../config';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/peers`;
const peerEndpoint = `${baseUrlV1}/peer`;
const networkEndpoint = `${baseUrlV1}/network`;

const peerSchema = {
	ip: 'string',
	location: 'object',
	state: 'number',
	version: 'string',
};

const peerStatistics = {
	basic: 'object',
	height: 'object',
	coreVer: 'object',
	os: 'object',
};

const peerOptionalSchema = {
	state: 'number',
	version: 'string',
	broadhash: 'string',
	height: 'number',
	httpPort: 'number',
	ip: 'string',
	location: 'object',
	nonce: 'string',
	os: 'string',
	wsPort: 'number',
};

const badRequestSchema = {
	errors: 'array',
	message: 'string',
};

const urlNotFoundSchema = {
	error: 'boolean',
	url: 'string',
};

const notFoundSchema = {
	error: 'boolean',
	message: 'string',
};

const responseEnvelopeSchema = {
	meta: 'object',
	data: 'array',
	links: 'object',
};

describe('GET /peers', () => {
	// mockserver
	it('required and optional properties  -> ok', async () => {
		const response = await api.get(`${endpoint}`);
		expect(response).toMapRequiredSchema(responseEnvelopeSchema);
		response.data.map(peer => expect(peer).toMapRequiredSchema(peerSchema));
		response.data.map(peer => expect(peer).toMapOptionalSchema(peerOptionalSchema));
	});

	it('wrong ip -> not found error', () => expect(api.get(`${endpoint}?ip=0`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));

	it('wrong url -> not found error', () => expect(api.get(`${endpoint}/112`, 404)).resolves.toMapRequiredSchema({
		...urlNotFoundSchema,
	}));

	it('wrong httpPort -> bad request error', () => expect(api.get(`${endpoint}?httpPort=70000000`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('wrong wsPort -> bad request error', () => expect(api.get(`${endpoint}?wsPort=70000000`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('wrong os -> not found error', () => expect(api.get(`${endpoint}?os=linux4.4.0-134-generic0000000`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));

	it('non-existent version -> not found error', () => expect(api.get(`${endpoint}?version=`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));

	it('invalid version -> bad request error', () => expect(api.get(`${endpoint}?state=3`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('non-existent height -> not found error', () => expect(api.get(`${endpoint}?height=1000000000`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));

	it('non-existent broadhash -> not found error', () => expect(api.get(`${endpoint}?broadhash=bf8b9d02a2167933be8c4a22b90992aee55204dca4452b3844208754a3baeb7b000000`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));

	it('limit=100 -> ok', async () => {
		const response = await api.get(`${endpoint}?limit=100`);
		expect(response.data).toBeArrayOfSize(100);
		expect(response.data[0]).toMapRequiredSchema(peerSchema);
	});

	it('empty limit -> bad request error', () => expect(api.get(`${endpoint}?limit=`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('empty offset -> bad request error', () => expect(api.get(`${endpoint}?offset=`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('too big offset -> not found error', () => expect(api.get(`${endpoint}?offset=1000000`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));

	it('empty sort -> bad request error', () => expect(api.get(`${endpoint}?sort=`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));

	it('wrong sort -> bad request error', () => expect(api.get(`${endpoint}?sort=height:ascc`, 400)).resolves.toMapRequiredSchema({
		...badRequestSchema,
	}));
});

describe('GET /peers/connected', () => {
	it('/peers/connected -> ok', async () => {
		const response = await api.get(`${endpoint}/connected`);
		expect(response).toMapRequiredSchema(responseEnvelopeSchema);
		response.data.map(peer => expect(peer).toMapRequiredSchema(peerSchema));
		response.data.map(peer => expect(peer).toMapOptionalSchema(peerOptionalSchema));
	});
});

describe('GET /peers/disconnected', () => {
	it('/peers/disconnected -> ok', async () => {
		const response = await api.get(`${endpoint}/disconnected`);
		expect(response).toMapRequiredSchema(responseEnvelopeSchema);
		response.data.map(peer => expect(peer).toMapRequiredSchema(peerSchema));
		response.data.map(peer => expect(peer).toMapOptionalSchema(peerOptionalSchema));
	});
});

describe('GET /peer/{ip}', () => {
	it('wrong ip -> not found error', () => expect(api.get(`${peerEndpoint}/0`, 404)).resolves.toMapRequiredSchema({
		...notFoundSchema,
	}));
});

describe('GET /network/statistics', () => {
	it('returns statistics', async () => {
		const url = `${networkEndpoint}/statistics`;
		const expectedStatus = 200;
		const response = await api.get(url, expectedStatus);
		return expect(response.data).toMapRequiredSchema(peerStatistics);
	});
});
