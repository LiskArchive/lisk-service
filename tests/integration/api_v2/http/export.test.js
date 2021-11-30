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
const config = require('../../../config');
const { api } = require('../../../helpers/api');

const {
	metaSchema,
	exportSchema,
	goodRequestSchema,
} = require('../../../schemas/api_v2/export.schema');

const {
	notFoundSchema,
} = require('../../../schemas/httpGenerics.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;

describe('Export API', () => {
	let refTransaction;
	beforeAll(async () => {
		const response1 = await api.get(`${baseUrlV2}/transactions?limit=1&moduleAssetId=2:0`);
		[refTransaction] = response1.data;
	});

	describe('Schedule file export', () => {
		it('Schedule file export -> return 202 Accepted', async () => {
			const expected = { ready: false };
			const response = await api.get(`${baseUrlV2}/transactions/export?address=${refTransaction.sender.address}`, 202);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchema);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('File is ready to export -> return 200 OK', async () => {
			const expected = { ready: true };
			const response = await api.get(`${baseUrlV2}/transactions/export?address=${refTransaction.sender.address}`, 200);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchema);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		// it('download csv file -> 200 OK', async () => {
		// 	const validFile = 'test.csv';
		// 	const response = await api.get(`${endpoint}/${validFile}`, 200);
		// 	expect(response).toEqual(expectedResponse);
		// });

		it('File not exists -> 404 NOT_FOUND', async () => {
			const invalidFile = 'invalid.csv';
			const response = await api.get(`${baseUrlV2}/exports/${invalidFile}`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});
});
