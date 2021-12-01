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
const moment = require('moment');
const config = require('../../../config');
const exportConfig = require('../../../../services/export/config');

const {
	api,
} = require('../../../helpers/api');

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

const {
	waitForSuccess,
	isStringCsvParseable,
} = require('../../../helpers/utils');

const httpStatus = {
	OK: 200,
	ACCEPTED: 202,
	NOT_FOUND: 404,
	BAD_REQUEST: 400,
};

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;

describe('Export API', () => {
	const startDate = moment('2021-01-10').format(exportConfig.csv.dateFormat);
	const endDate = moment('2021-11-30').format(exportConfig.csv.dateFormat);
	let refTransaction1;
	let refTransaction2;
	beforeAll(async () => {
		const response1 = await api.get(`${baseUrlV2}/transactions?limit=1`);
		[refTransaction1] = response1.data;

		const response2 = await api.get(`${baseUrlV2}/transactions?limit=1&offset=1`);
		[refTransaction2] = response2.data;
	});

	describe('Schedule file export', () => {
		it('Schedule file export from account address -> return 202 Accepted', async () => {
			const expected = { ready: false };
			const response = await api.get(
				`${baseUrlV2}/transactions/export?address=${refTransaction1.sender.address}&interval=${startDate}:${endDate}`,
				httpStatus.ACCEPTED,
			);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchemaAccepted);
			expect(response.meta).toMap(metaSchema);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('Schedule file export from account publicKey -> return 202 Accepted', async () => {
			const expected = { ready: false };
			const response = await api.get(
				`${baseUrlV2}/transactions/export?publicKey=${refTransaction2.sender.publicKey}&interval=${startDate}:${endDate}`,
				httpStatus.ACCEPTED,
			);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchemaAccepted);
			expect(response.meta).toMap(metaSchema);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});
	});

	describe('File is ready to export', () => {
		it('scheduled from account address -> return 200 OK', async () => {
			const scheduleExport = async () => api
				.get(
					`${baseUrlV2}/transactions/export?address=${refTransaction1.sender.address}&interval=${startDate}:${endDate}`,
					httpStatus.OK,
				);
			const response = await waitForSuccess(scheduleExport);
			const expected = { ready: true };
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchema);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('scheduled from account from publicKey -> return 200 OK', async () => {
			const scheduleExport = async () => api
				.get(
					`${baseUrlV2}/transactions/export?publicKey=${refTransaction2.sender.publicKey}&interval=${startDate}:${endDate}`,
					httpStatus.OK,
				);
			const response = await waitForSuccess(scheduleExport);
			const expected = { ready: true };
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchema);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});
	});

	describe('Download csv file -> returns 200 OK', () => {
		const parseParams = { delimiter: exportConfig.csv.delimiter };

		it('scheduled from account address -> 200 OK', async () => {
			const validFileName = `transactions_${refTransaction1.sender.address}_${startDate}_${endDate}.csv`;
			const response = await api.get(`${baseUrlV2}/exports/${validFileName}`, httpStatus.OK);
			expect(isStringCsvParseable(response, parseParams)).toBeTruthy();
		});

		it('scheduled from account publicKey -> 200 OK', async () => {
			const validFileName = `transactions_${refTransaction2.sender.address}_${startDate}_${endDate}.csv`;
			const response = await api.get(`${baseUrlV2}/exports/${validFileName}`, httpStatus.OK);
			expect(isStringCsvParseable(response, parseParams)).toBeTruthy();
		});
	});

	describe('Invalid params/request', () => {
		it('Schedule file export -> 400 when no params', async () => {
			const response = await api.get(`${baseUrlV2}/transactions/export`, httpStatus.BAD_REQUEST);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when invalid address', async () => {
			const response = await api.get(
				`${baseUrlV2}/transactions/export?address=lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when invalid publicKey', async () => {
			const response = await api.get(
				`${baseUrlV2}/transactions/export?publicKey=d517f9d9ac10a61b57d1959b88f8b5c6e8824d27a5349ec7ece44c4a027c4`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when address with invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await api.get(
				`${baseUrlV2}/transactions/export?address=${refTransaction1.sender.address}&interval=${invalidInterval}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when publicKey with invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await api.get(
				`${baseUrlV2}/transactions/export?publicKey=${refTransaction2.sender.publicKey}&interval=${invalidInterval}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when invalid address with interval', async () => {
			const response = await api.get(
				`${baseUrlV2}/transactions/export?address=lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm&interval=${startDate}:${endDate}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when invalid publicKey with interval', async () => {
			const response = await api.get(
				`${baseUrlV2}/transactions/export?publicKey=d517f9d9ac10a61b57d1959b88f8b5c6e8824d27a5349ec7ece44c4a027c4&interval=${startDate}:${endDate}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('File not exists -> 404 NOT_FOUND', async () => {
			const invalidFile = 'invalid.csv';
			const response = await api.get(`${baseUrlV2}/exports/${invalidFile}`, httpStatus.NOT_FOUND);
			expect(response).toMap(notFoundSchema);
		});
	});
});
