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
	exportSchemaAccepted,
	goodRequestSchema,
} = require('../../../schemas/api_v2/export.schema');

const {
	notFoundSchema,
	badRequestSchema,
} = require('../../../schemas/httpGenerics.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;

describe('Export API', () => {
	const startDate = '2021-01-10';
	const endDate = '2021-11-30';
	let refTransaction;
	beforeAll(async () => {
		const response1 = await api.get(`${baseUrlV2}/transactions?limit=1&moduleAssetId=2:0`);
		[refTransaction] = response1.data;
	});

	describe('Schedule file export', () => {
		it('Schedule file export -> return 202 Accepted', async () => {
			const expected = { ready: false };
			const response = await api.get(`${baseUrlV2}/transactions/export?address=${refTransaction.sender.address}&interval=${startDate}:${endDate}`, 202);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchemaAccepted);
			expect(response.meta).toMap(metaSchema);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('Schedule file export -> 400 when no address', async () => {
			const response = await api.get(`${baseUrlV2}/transactions/export`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when invalid address', async () => {
			const response = await api.get(`${baseUrlV2}/transactions/export?address=lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await api.get(`${baseUrlV2}/transactions/export?address=${refTransaction.sender.address}&interval=${invalidInterval}`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('File is ready to export -> return 200 OK', async () => {
			// Add delay of 10 seconds
			await new Promise(resolve => setTimeout(resolve, 10000));

			const expected = { ready: true };
			const response = await api.get(`${baseUrlV2}/transactions/export?address=${refTransaction.sender.address}&interval=${startDate}:${endDate}`, 200);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchema);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('Download csv file -> 200 OK', async () => {
			const validFileName = `transactions_${refTransaction.sender.address}_${startDate}_${endDate}.csv`;
			await api.get(`${baseUrlV2}/exports/${validFileName}`, 200);
		});

		it('File not exists -> 404 NOT_FOUND', async () => {
			const invalidFile = 'invalid.csv';
			const response = await api.get(`${baseUrlV2}/exports/${invalidFile}`, 404);
			expect(response).toMap(notFoundSchema);
		});
	});
});
