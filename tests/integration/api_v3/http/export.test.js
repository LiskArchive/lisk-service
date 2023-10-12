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
	isStringCsvParsable,
} = require('../../../helpers/utils');

const httpStatus = {
	OK: 200,
	ACCEPTED: 202,
	NOT_FOUND: 404,
	BAD_REQUEST: 400,
};

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const networkStatusEndpoint = `${baseUrlV3}/network/status`;

let curChainID;

describe('Export API', () => {
	const startDate = moment('2023-01-10').format(exportConfig.excel.dateFormat);
	const endDate = moment('2023-11-30').format(exportConfig.excel.dateFormat);
	let refTransaction1;
	let refTransaction2;
	let refTransaction3;
	let refTransaction4;

	beforeAll(async () => {
		const uniqueSenders = new Set();

		// Blacklist addresses hardcoded in RPC export tests
		const restrictedAddress = ['lsk8gnejvorhq8bsrrmwq8oxpu5ufubxpn7ohukrn', 'lsko8844sbbaq2vwpb7mc2p7shy7b3k8zx5tgecdn'];
		restrictedAddress.forEach(item => uniqueSenders.add(item));

		let offset = 0;
		while (uniqueSenders.size < 4) {
			// eslint-disable-next-line no-await-in-loop
			const response = await api.get(`${baseUrlV3}/transactions?limit=100&offset=${offset}`);
			const transactions = response.data;

			if (transactions.length < 4) {
				throw new Error('Need at least 4 transactions from unique senders to run this test.');
			}

			// eslint-disable-next-line no-restricted-syntax
			for (const transaction of transactions) {
				if (!uniqueSenders.has(transaction.sender.address)) {
					if (!refTransaction1) {
						refTransaction1 = transaction;
						uniqueSenders.add(transaction.sender.address);
					} else if (!refTransaction2) {
						refTransaction2 = transaction;
						uniqueSenders.add(transaction.sender.address);
					} else if (!refTransaction3) {
						refTransaction3 = transaction;
						uniqueSenders.add(transaction.sender.address);
					} else if (!refTransaction4) {
						refTransaction4 = transaction;
						uniqueSenders.add(transaction.sender.address);
					}
				}
			}
			offset += 100;
		}

		const networkStatus = await api.get(networkStatusEndpoint);
		curChainID = networkStatus.data.chainID;
	});

	describe('Schedule file export', () => {
		it('should return 202 Accepted when scheduling file export from account address with interval', async () => {
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

		it('should return 202 Accepted when scheduling file export from account publicKey with interval', async () => {
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

		it('should return 202 Accepted when scheduling file export from account address', async () => {
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

		it('should return 202 Accepted when scheduling file export from account publicKey', async () => {
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
		const successValidator = (response) => response.meta.ready;

		it('should return 200 OK when scheduled from account address', async () => {
			jest.setTimeout(300000);
			const scheduleExport = async () => api.get(
				`${baseUrlV3}/export/transactions?address=${refTransaction1.sender.address}&interval=${startDate}:${endDate}`,
				httpStatus.OK,
			);
			const response = await waitForSuccess(scheduleExport, successValidator);
			const expected = { ready: true };
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});

		it('should return 200 OK when scheduled from account publicKey', async () => {
			jest.setTimeout(300000);
			const scheduleExport = async () => api.get(
				`${baseUrlV3}/export/transactions?publicKey=${refTransaction2.sender.publicKey}&interval=${startDate}:${endDate}`,
				httpStatus.OK,
			);
			const response = await waitForSuccess(scheduleExport, successValidator);
			const expected = { ready: true };
			expect(response).toMap(goodRequestSchemaForExport);
			expect(response.data).toBeInstanceOf(Object);
			expect(response.data).toMap(exportSchema);
			expect(response.meta).toMap(metaSchemaForExport);
			expect(response.meta).toEqual(expect.objectContaining(expected));
		});
	});

	describe('Download processed transaction history -> returns 200 OK', () => {
		const parseParams = { delimiter: exportConfig.excel.delimiter };
		const successValidator = (response) => response.meta.ready;

		it('should return 200 OK when scheduled from account address', async () => {
			jest.setTimeout(300000);
			const scheduleExport = async () => api.get(
				`${baseUrlV3}/export/transactions?address=${refTransaction1.sender.address}&interval=${startDate}:${endDate}`,
				httpStatus.OK,
			);
			await waitForSuccess(scheduleExport, successValidator);

			const validFileName = `transactions_${curChainID}_${refTransaction1.sender.address}_${startDate}_${endDate}.xlsx`;
			const response = await api.get(`${baseUrlV3}/export/download?filename=${validFileName}`, httpStatus.OK);
			expect(isStringCsvParsable(response, parseParams)).toBeTruthy();
		});

		it('should return 200 OK when scheduled from account publicKey', async () => {
			jest.setTimeout(300000);
			const scheduleExport = async () => api.get(
				`${baseUrlV3}/export/transactions?publicKey=${refTransaction2.sender.publicKey}&interval=${startDate}:${endDate}`,
				httpStatus.OK,
			);
			await waitForSuccess(scheduleExport, successValidator);

			const validFileName = `transactions_${curChainID}_${refTransaction2.sender.address}_${startDate}_${endDate}.xlsx`;
			const response = await api.get(`${baseUrlV3}/export/download?filename=${validFileName}`, httpStatus.OK);
			expect(isStringCsvParsable(response, parseParams)).toBeTruthy();
		});
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
				`${baseUrlV3}/export/transactions?address=${refTransaction1.sender.address}&interval=${invalidInterval}`,
				httpStatus.BAD_REQUEST,
			);
			expect(response).toMap(badRequestSchema);
		});

		it('should return 400 BAD REQUEST when scheduling file export with a publicKey and an invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await api.get(
				`${baseUrlV3}/export/transactions?publicKey=${refTransaction2.sender.publicKey}&interval=${invalidInterval}`,
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
			const validFileName = `transactions_99999999_${refTransaction1.sender.address}_${startDate}_${endDate}.xlsx`;
			const response = await api.get(`${baseUrlV3}/export/download?filename=${validFileName}`, httpStatus.NOT_FOUND);
			expect(response).toMap(notFoundSchema);
		});
	});
});
