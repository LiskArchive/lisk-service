/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
	metaSchemaForExport,
	exportSchema,
	exportSchemaAccepted,
	goodRequestSchemaForExport,
} = require('../../../schemas/api_v3/export.schema');

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
const baseUrlV3 = `${baseUrl}/api/v3`;

// TODO: Enable tests once test blockchain is updated with transactions
xdescribe('Export API', () => {
	const startDate = moment('2021-01-10').format(exportConfig.csv.dateFormat);
	const endDate = moment('2021-11-30').format(exportConfig.csv.dateFormat);
	let refTransaction1;
	let refTransaction2;
	let refTransaction3;
	let refTransaction4;
	beforeAll(async () => {
		const response = await api.get(`${baseUrlV3}/transactions?limit=4`);
		[refTransaction1, refTransaction2, refTransaction3, refTransaction4] = response.data;
	});

	describe('Schedule file export', () => {
		it('Schedule file export from account address with interval -> return 202 Accepted', async () => {
			const expected = { ready: false };
			const response = await api.get(
				`${baseUrlV3}/export/transactions?address=${refTransaction1.sender.address}&interval=${startDate}:${endDate}`,
				httpStatus.ACCEPTED,
			);
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchemaAccepted);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('Schedule file export from account publicKey with interval -> return 202 Accepted', async () => {
			const expected = { ready: false };
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=${refTransaction2.sender.publicKey}&interval=${startDate}:${endDate}`,
				httpStatus.ACCEPTED,
			);
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchemaAccepted);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('Schedule file export from account address -> return 202 Accepted', async () => {
			const expected = { ready: false };
			const response = await api.get(
				`${baseUrlV3}/export/transactions?address=${refTransaction3.sender.address}`,
				httpStatus.ACCEPTED,
			);
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchemaAccepted);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('Schedule file export from account publicKey -> return 202 Accepted', async () => {
			const expected = { ready: false };
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=${refTransaction4.sender.publicKey}`,
				httpStatus.ACCEPTED,
			);
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchemaAccepted);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});
	});

	describe('File is ready to export', () => {
		it('scheduled from account address -> return 200 OK', async () => {
			const scheduleExport = async () => api
				.get(
					`${baseUrlV3}/export/transactions?address=${refTransaction1.sender.address}&interval=${startDate}:${endDate}`,
					httpStatus.OK,
				);
			const response = await waitForSuccess(scheduleExport);
			const expected = { ready: true };
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('scheduled from account from publicKey -> return 200 OK', async () => {
			const scheduleExport = async () => api
				.get(
					`${baseUrlV3}/export/transactions?publicKey=${refTransaction2.sender.publicKey}&interval=${startDate}:${endDate}`,
					httpStatus.OK,
				);
			const response = await waitForSuccess(scheduleExport);
			const expected = { ready: true };
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});
	});

	describe('Download csv file -> returns 200 OK', () => {
		const parseParams = { delimiter: exportConfig.csv.delimiter };

		it('scheduled from account address -> 200 OK', async () => {
			const validFileName = `transactions_${refTransaction1.sender.address}_${startDate}_${endDate}.csv`;
			const response = await api.get(`${baseUrlV3}/export/download?filename=${validFileName}`, httpStatus.OK);
			expect(isStringCsvParseable(response, parseParams)).toBeTruthy();
		});

		it('scheduled from account publicKey -> 200 OK', async () => {
			const validFileName = `transactions_${refTransaction2.sender.address}_${startDate}_${endDate}.csv`;
			const response = await api.get(`${baseUrlV3}/export/download?filename=${validFileName}`, httpStatus.OK);
			expect(isStringCsvParseable(response, parseParams)).toBeTruthy();
		});
	});

	describe('Invalid params/request', () => {
		it('Schedule file export -> 400 when no params', async () => {
			const response = await api.get(`${baseUrlV3}/export/transactions`, httpStatus.BAD_REQUEST);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when invalid address', async () => {
			const response = await api.get(
				`${baseUrlV3}/export/transactions?address=lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when invalid publicKey', async () => {
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=d517f9d9ac10a61b57d1959b88f8b5c6e8824d27a5349ec7ece44c4a027c4`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when address with invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await api.get(
				`${baseUrlV3}/export/transactions?address=${refTransaction1.sender.address}&interval=${invalidInterval}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when publicKey with invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=${refTransaction2.sender.publicKey}&interval=${invalidInterval}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when invalid address with interval', async () => {
			const response = await api.get(
				`${baseUrlV3}/export/transactions?address=lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm&interval=${startDate}:${endDate}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('Schedule file export -> 400 when invalid publicKey with interval', async () => {
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=d517f9d9ac10a61b57d1959b88f8b5c6e8824d27a5349ec7ece44c4a027c4&interval=${startDate}:${endDate}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('File not exists -> 404 NOT_FOUND', async () => {
			const invalidFile = 'invalid.csv';
			const response = await api.get(`${baseUrlV3}/export/download?filename=${invalidFile}`, httpStatus.NOT_FOUND);
			expect(response).toMap(notFoundSchema);
		});
	});
});
