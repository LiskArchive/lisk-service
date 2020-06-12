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
import * as cryptography from '@liskhq/lisk-cryptography';

import api from '../../helpers/api';
// import config from '../../config';
// import jsonData from '../../data/storage_putData.json';
// import dataForQuota from '../../data/storage_over_quota.json';
import dataBookmarks from '../../data/bookmarks.json';
// import { head } from 'popsicle';

// For singnature / encryption
const defaultLatency = 3 * 1000;
const granularity = 10 * 1000;
const userPublicKey = '9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9f2f0f';
const userPassphrase = 'robust swift grocery peasant forget share enable convince deputy road keep cheap';

const generateClientTimestamp = () =>
	Math.floor(((new Date()).getTime() + defaultLatency) / granularity);

const signMessage = (inputMessage, passphrase) => {
	const clientMessage = `${inputMessage}:${generateClientTimestamp()}`;
	const signedMessage = cryptography.signMessageWithPassphrase(
		clientMessage,
		passphrase,
	);

	return signedMessage;
};

// const baseUrl = config.SERVICE_ENDPOINT;
// const baseUrlV1 = `${baseUrl}/api/v1`;
// const endpoint = `${baseUrlV1}/storage`;

const endpoint = 'http://localhost:9901/api/v1/storage';

const validStore = 'bookmarks';
// const invalidStore = 'se11111ttings';

const storageDataSchema = {
	data: 'string',
	meta: 'object',
	links: 'object',
};

/*
const deletedDataSchema = {
	meta: 'object',
	links: 'object',
};

const badRequestSchema = {
	errors: 'array',
	message: 'string',
};

const notFoundSchema = {
	error: 'boolean',
	message: 'string',
};

const dataExeedsMaxSchema = {
	error: true,
	message: 'Data size exceeds maximum permitted.',
};

const smallData = { data: dataForQuota.data.slice(0, -1) };

const largeData = { data: `${dataForQuota.data}d` };
*/

xdescribe('PUT /storage', () => {
	it('save bookmarks with signature', async () => {
		const url = `${endpoint}/${validStore}/${userPublicKey}`;
		const method = 'put';
		const bookmarks = JSON.stringify(dataBookmarks);
		const data = { data: bookmarks };
		const signature = signMessage(bookmarks, userPassphrase);
		const headers = { 'X-Signature': signature.signature };
		// console.log(`Sending data to ${url},
		// headers: ${JSON.stringify(headers)},
		// data.length ${JSON.stringify(data).length}`);

		const response = await api.request({ method, url, headers, data });

		expect(response).toMapRequiredSchema({
			...storageDataSchema,
			data: JSON.stringify(dataBookmarks),
		});
		expect(response.meta).toMapRequiredSchema({
			storeName: validStore,
			storeId: userPublicKey,
		});
	});

	// it('put data with storeName:bookmarks & storeId -> ok', async () => {
	// 	const response = await api.put(`${endpoint}/bookmarks/1085993630748340485L`, jsonData, 200);
	// 	expect(response).toMapRequiredSchema({
	// 		...storageDataSchema,
	// 		data: 'sample data',
	// 	});
	// 	expect(response.meta).toMapRequiredSchema({
	// 		storeName: 'bookmarks',
	// 		storeId: '1085993630748340485L',
	// 	});
	// });

	// it('put data with storeName:notifications & storeId -> ok', async () => {
	// 	const response = await api.put(
	// 	  `${endpoint}/notifications/1085993630748340485L`, jsonData, 200);
	// 	expect(response).toMapRequiredSchema({
	// 		...storageDataSchema,
	// 		data: 'sample data',
	// 	});
	// 	expect(response.meta).toMapRequiredSchema({
	// 		storeName: 'notifications',
	// 		storeId: '1085993630748340485L',
	// 	});
	// });

	// it('put data with invalid storeName -> 404', async () => {
	// 	const response = await api.put(`${endpoint}/settings/1085993630748340485L`, jsonData, 404);
	// 	expect(response).toMapRequiredSchema(notFoundSchema);
	// });

	// // To-do - complete the test after validating storeId is implemented
	// xit('put data with invalid storeId -> 400', async () => {
	// 	const response = await api.put(`${endpoint}/setting/000L`, jsonData, 404);
	// 	expect(response).toMapRequiredSchema(notFoundSchema);
	// });

	// it('put data whose data size is smaller than quota -> ok', async () => {
	// 	const response = await api.put(`${endpoint}/setting/1085993630748340485L`, smallData, 200);
	// 	expect(response).toMapRequiredSchema(storageDataSchema);
	// 	expect(response.meta).toMapRequiredSchema({
	// 		storeName: 'setting',
	// 		storeId: '1085993630748340485L',
	// 	});
	// });

	// it('put data whose data size is equal to quota -> ok', async () => {
	// 	const response = await api.put(`${endpoint}/setting/1085993630748340485L`, dataForQuota, 200);
	// 	expect(response).toMapRequiredSchema(storageDataSchema);
	// 	expect(response.meta).toMapRequiredSchema({
	// 		storeName: 'setting',
	// 		storeId: '1085993630748340485L',
	// 	});
	// });

	// it('put data whose data size is above quota -> 413', async () => {
	// 	const response = await api.put(`${endpoint}/setting/1085993630748340485L`, largeData, 413);
	// 	expect(response).toMapRequiredSchema(dataExeedsMaxSchema);
	// });
});

xdescribe('GET /storage', () => {
	it('retrieve data with signature', async () => {
		const url = `${endpoint}/${validStore}/${userPublicKey}`;
		const method = 'get';
		const signature = signMessage(userPublicKey, userPassphrase);
		const headers = { 'X-Signature': signature.signature };

		const response = await api.request({ method, url, headers });

		expect(response).toMapRequiredSchema({
			...storageDataSchema,
			data: JSON.stringify(dataBookmarks),
		});
		expect(response.meta).toMapRequiredSchema({
			storeName: validStore,
			storeId: userPublicKey,
		});
	});

	// it('get data with known storeName:bookmarks & storeId -> ok', async () => {
	// 	const response = await api.get(`${endpoint}/bookmarks/1085993630748340485L`, 200);
	// 	expect(response).toMapRequiredSchema({
	// 		...storageDataSchema,
	// 		data: 'sample data',
	// 	});
	// 	expect(response.meta).toMapRequiredSchema({
	// 		storeName: 'bookmarks',
	// 		storeId: '1085993630748340485L',
	// 	});
	// });

	// it('get data with known storeName:notifications & storeId -> ok', async () => {
	// 	const response = await api.get(`${endpoint}/notifications/1085993630748340485L`, 200);
	// 	expect(response).toMapRequiredSchema({
	// 		...storageDataSchema,
	// 		data: 'sample data',
	// 	});
	// 	expect(response.meta).toMapRequiredSchema({
	// 		storeName: 'notifications',
	// 		storeId: '1085993630748340485L',
	// 	});
	// });

	// it('get data with invalid storeName -> 404', async () => {
	// 	const response = await api.get(`${endpoint}/settings/1085993630748340485L`, 404);
	// 	expect(response).toMapRequiredSchema(notFoundSchema);
	// });

	// // To-do - complete the test after validating storeId is implemented
	// xit('get data with invalid storeId -> 400', async () => {
	// 	const response = await api.get(`${endpoint}/setting/000L`, 404);
	// 	expect(response).toMapRequiredSchema(notFoundSchema);
	// });
});

xdescribe('DEL /storage', () => {
	it('retrieve data with signature', async () => {
		const url = `${endpoint}/${validStore}/${userPublicKey}`;
		const method = 'delete';
		const signature = signMessage(userPublicKey, userPassphrase);
		const headers = { 'X-Signature': signature.signature };

		const response = await api.request({ method, url, headers });

		// TODO: Fix that
		expect(response).toMapRequiredSchema({ meta: 'object', links: 'object' });
	});

	// it('delete data with storeName:setting known & storeId -> ok', async () => {
	// 	const response = await api.del(`${endpoint}/setting/1085993630748340485L`, 200);
	// 	expect(response).toMapRequiredSchema(deletedDataSchema);
	// 	expect(response.meta).toEqual({});
	// 	expect(response.links).toEqual({});
	// });

	// it('no data after delete with storeName:setting -> 404', async () => {
	// 	const response = await api.get(`${endpoint}/setting/1085993630748340485L`, 404);
	// 	expect(response).toMapRequiredSchema(notFoundSchema);
	// });

	// it('delete data with storeName:bookmarks known & storeId -> ok', async () => {
	// 	const response = await api.del(`${endpoint}/bookmarks/1085993630748340485L`, 200);
	// 	expect(response).toMapRequiredSchema(deletedDataSchema);
	// 	expect(response.meta).toEqual({});
	// 	expect(response.links).toEqual({});
	// });

	// it('no data after delete with storeName:bookmarks -> 404', async () => {
	// 	const response = await api.get(`${endpoint}/bookmarks/1085993630748340485L`, 404);
	// 	expect(response).toMapRequiredSchema(notFoundSchema);
	// });

	// it('delete data with storeName:notifications known & storeId -> ok', async () => {
	// 	const response = await api.del(`${endpoint}/notifications/1085993630748340485L`, 200);
	// 	expect(response).toMapRequiredSchema(deletedDataSchema);
	// 	expect(response.meta).toEqual({});
	// 	expect(response.links).toEqual({});
	// });

	// it('no data after delete with storeName:notifications -> 404', async () => {
	// 	const response = await api.get(`${endpoint}/notifications/1085993630748340485L`, 404);
	// 	expect(response).toMapRequiredSchema(notFoundSchema);
	// });

	// it('delete data with invalid storeName -> 404', async () => {
	// 	const response = await api.del(`${endpoint}/settings/1085993630748340485L`, 404);
	// 	expect(response).toMapRequiredSchema(notFoundSchema);
	// });

	// // To-do - complete the test after validating storeId is implemented
	// xit('delete data with invalid storeId -> 400', async () => {
	// 	const response = await api.del(`${endpoint}/setting/000L`, 400);
	// 	expect(response).toMapRequiredSchema(badRequestSchema);
	// });
});
