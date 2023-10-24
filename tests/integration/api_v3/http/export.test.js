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

const { api } = require('../../../helpers/api');

const {
	metaSchemaForExport,
	exportSchema,
	exportSchemaAccepted,
	goodRequestSchemaForExport,
} = require('../../../schemas/api_v3/export.schema');

const { notFoundSchema, badRequestSchema } = require('../../../schemas/httpGenerics.schema');

const { waitForSuccess, isStringCsvParsable } = require('../../../helpers/utils');

const httpStatus = {
	OK: 200,
	ACCEPTED: 202,
	NOT_FOUND: 404,
	BAD_REQUEST: 400,
};

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;

describe('Export API', () => {
	const startDate = moment('2023-01-10').format(exportConfig.excel.dateFormat);
	const endDate = moment('2023-11-30').format(exportConfig.excel.dateFormat);

	const mockAddress1 = 'lsk969u84bnws8zc52cu59o8aamvpyg8nw86hpgad';
	const mockAddress2 = 'lsk2jjg9ob4qh7jokpdbf7hjgqftkaq4b2925f422';
	const mockPublicKey1 = 'ebe2c469275b2eac44f05684c974454f7eecc6d2a8c1b72bf37fffbeb5419ccd';
	const mockPublicKey2 = '674061bfeea0eddb4c88fc7bc03ef694f5040358b2b14edba99bc8ebddfd7c97';

	describe('Schedule file export', () => {
		it('should return 202 Accepted when scheduling file export from account address with interval', async () => {
			const expected = { ready: false };
			const response = await api.get(
				`${baseUrlV3}/export/transactions?address=${mockAddress1}&interval=${startDate}:${endDate}`,
				httpStatus.ACCEPTED,
			);
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchemaAccepted);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('should return 202 Accepted when scheduling file export from account publicKey with interval', async () => {
			const expected = { ready: false };
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=${mockPublicKey1}&interval=${startDate}:${endDate}`,
				httpStatus.ACCEPTED,
			);
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchemaAccepted);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('should return 202 Accepted when scheduling file export from account address', async () => {
			const expected = { ready: false };
			const response = await api.get(
				`${baseUrlV3}/export/transactions?address=${mockAddress2}`,
				httpStatus.ACCEPTED,
			);
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchemaAccepted);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('should return 202 Accepted when scheduling file export from account publicKey', async () => {
			const expected = { ready: false };
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=${mockPublicKey2}`,
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
		const successValidator = response => response.meta.ready;

		it('should return 200 OK when scheduled from account address', async () => {
			const scheduleExport = async () =>
				api.get(`${baseUrlV3}/export/transactions?address=${mockAddress2}`, httpStatus.OK);
			const response = await waitForSuccess(scheduleExport, successValidator);
			const expected = { ready: true };
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		}, 2147483647);

		it('should return 200 OK when scheduled from account publicKey', async () => {
			const scheduleExport = async () =>
				api.get(`${baseUrlV3}/export/transactions?publicKey=${mockPublicKey2}`, httpStatus.OK);
			const response = await waitForSuccess(scheduleExport, successValidator);
			const expected = { ready: true };
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		}, 2147483647);
	});

	describe('Download processed transaction history -> returns 200 OK', () => {
		const parseParams = { delimiter: exportConfig.excel.delimiter };
		const successValidator = response => response.meta.ready;

		it('should return 200 OK when scheduled from account address', async () => {
			const scheduleExport = async () =>
				api.get(`${baseUrlV3}/export/transactions?address=${mockAddress2}`, httpStatus.OK);
			const res = await waitForSuccess(scheduleExport, successValidator);

			const response = await api.get(`${baseUrl}${res.data.fileUrl}`, httpStatus.OK);
			expect(isStringCsvParsable(response, parseParams)).toBeTruthy();
		}, 2147483647);

		it('should return 200 OK when scheduled from account publicKey', async () => {
			const scheduleExport = async () =>
				api.get(`${baseUrlV3}/export/transactions?publicKey=${mockPublicKey2}`, httpStatus.OK);
			const res = await waitForSuccess(scheduleExport, successValidator);

			const response = await api.get(`${baseUrl}${res.data.fileUrl}`, httpStatus.OK);
			expect(isStringCsvParsable(response, parseParams)).toBeTruthy();
		}, 2147483647);
	});

	describe('Invalid params/request', () => {
		it('should return 400 BAD REQUEST when scheduling file export with no params', async () => {
			const response = await api.get(`${baseUrlV3}/export/transactions`, httpStatus.BAD_REQUEST);
			expect(response).toMap(badRequestSchema);
		});

		it('should return 400 BAD REQUEST when scheduling file export with an invalid address', async () => {
			const response = await api.get(
				`${baseUrlV3}/export/transactions?address=lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('should return 400 BAD REQUEST when scheduling file export with an invalid publicKey', async () => {
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=d517f9d9ac10a61b57d1959b88f8b5c6e8824d27a5349ec7ece44c4a027c4`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('should return 400 BAD REQUEST when scheduling file export with an address and an invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await api.get(
				`${baseUrlV3}/export/transactions?address=${mockAddress1}&interval=${invalidInterval}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('should return 400 BAD REQUEST when scheduling file export with a publicKey and an invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=${mockPublicKey1}&interval=${invalidInterval}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('should return 400 BAD REQUEST when scheduling file export with an invalid address and a valid interval', async () => {
			const response = await api.get(
				`${baseUrlV3}/export/transactions?address=lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm&interval=${startDate}:${endDate}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('should return 400 BAD REQUEST when scheduling file export with an invalid publicKey and a valid interval', async () => {
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=d517f9d9ac10a61b57d1959b88f8b5c6e8824d27a5349ec7ece44c4a027c4&interval=${startDate}:${endDate}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('should return 404 NOT FOUND when attempting to download a non-existent file', async () => {
			const validFileName = `transactions_99999999_${mockAddress1}_${startDate}_${endDate}.xlsx`;
			const response = await api.get(
				`${baseUrlV3}/export/download?filename=${validFileName}`,
				httpStatus.NOT_FOUND,
			);
			expect(response).toMap(notFoundSchema);
		});
	});
});
