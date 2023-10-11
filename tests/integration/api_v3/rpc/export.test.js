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
jest.setTimeout(2147483647);

const moment = require('moment');

const config = require('../../../config');
const exportConfig = require('../../../../services/export/config');
const {
	request,
} = require('../../../helpers/socketIoRpcRequest');
const {
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
	invalidRequestSchema,
} = require('../../../schemas/rpcGenerics.schema');
const {
	metaSchemaForExport,
	exportSchema,
	exportSchemaAccepted,
	goodRequestSchemaForExport,
} = require('../../../schemas/api_v3/export.schema');

const { waitForSuccess } = require('../../../helpers/utils');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const requestTransactionExport = async (params) => request(wsRpcUrl, 'get.export.transactions', params);
const requestTransactions = async (params) => request(wsRpcUrl, 'get.transactions', params);

// TODO: Enable tests once test blockchain is updated with transactions
describe('Export API', () => {
	const startDate = moment('2023-01-10').format(exportConfig.excel.dateFormat);
	const endDate = moment('2023-12-30').format(exportConfig.excel.dateFormat);

	let refTransaction1;
	let refTransaction2;
	beforeAll(async () => {
		const uniqueSenders = new Set();

		let offset = 200;
		while (uniqueSenders.size < 4) {
			// eslint-disable-next-line no-await-in-loop
			const response = await requestTransactions({ limit: 100, offset });
			const transactions = response.result.data;

			if (transactions.length === 0) {
				throw new Error('Need atleast 4 transactions from unique senders to run this test.');
			}

			// eslint-disable-next-line no-restricted-syntax
			for (const transaction of transactions) {
				if (!uniqueSenders.has(transaction.sender.address)) {
					if (!refTransaction1 && uniqueSenders.size >= 4) {
						refTransaction1 = transaction;
					} else if (!refTransaction2 && uniqueSenders.size >= 5) {
						refTransaction2 = transaction;
					}

					uniqueSenders.add(transaction.sender.address);
				}
			}
			offset += 100;
		}
	});

	describe('Schedule file export', () => {
		it('Schedule file export from account address with interval', async () => {
			const expected = { ready: false };
			const response = await requestTransactionExport({
				address: refTransaction1.sender.address,
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;

			expect(result).toMap(goodRequestSchemaForExport);
			expect(result.data).toMap(exportSchemaAccepted);
			expect(result.meta).toMap(metaSchemaForExport);
			expect(result.meta).toEqual(expect.objectContaining(expected));
		});

		it('Schedule file export from account publicKey with interval', async () => {
			const expected = { ready: false };
			const response = await requestTransactionExport({
				publicKey: refTransaction2.sender.publicKey,
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodRequestSchemaForExport);
			expect(result.data).toMap(exportSchemaAccepted);
			expect(result.meta).toMap(metaSchemaForExport);
			expect(result.meta).toEqual(expect.objectContaining(expected));
		});
	});

	describe('File is ready to export', () => {
		const successValidator = (response) => response.result.meta.ready;

		it('scheduled from account address', async () => {
			const scheduleExport = async () => requestTransactionExport({
				address: refTransaction1.sender.address,
				interval: `${startDate}:${endDate}`,
			});
			const response = await waitForSuccess(scheduleExport, successValidator);
			const expected = { ready: true };
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodRequestSchemaForExport);
			expect(result.data).toMap(exportSchema);
			expect(result.meta).toMap(metaSchemaForExport);
			expect(result.meta).toEqual(expect.objectContaining(expected));
		});

		it('scheduled from account publicKey', async () => {
			const scheduleExport = async () => requestTransactionExport({
				publicKey: refTransaction2.sender.publicKey,
				interval: `${startDate}:${endDate}`,
			});
			const response = await waitForSuccess(scheduleExport, successValidator);
			const expected = { ready: true };
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodRequestSchemaForExport);
			expect(result.data).toMap(exportSchema);
			expect(result.meta).toMap(metaSchemaForExport);
			expect(result.meta).toEqual(expect.objectContaining(expected));
		});
	});

	describe('Invalid params/request', () => {
		it('return INVALID_REQUEST when no address', async () => {
			const response = await requestTransactionExport();
			expect(response).toMap(invalidRequestSchema);
		});

		it('return INVALID_PARAMS when invalid address', async () => {
			const response = await requestTransactionExport({
				address: 'lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm',
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('return INVALID_PARAMS when invalid publicKey', async () => {
			const response = await requestTransactionExport({
				publicKey: 'd517f9d9ac10a61b57d1959b88f8b5c6e8824d27a5349ec7ece44c4a027c4',
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('return INVALID_PARAMS when address with invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await requestTransactionExport({
				address: refTransaction1.sender.address,
				interval: invalidInterval,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('return INVALID_PARAMS when publicKey with invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await requestTransactionExport({
				publicKey: refTransaction2.sender.publicKey,
				interval: invalidInterval,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('return INVALID_PARAMS when invalid address with interval', async () => {
			const response = await requestTransactionExport({
				address: 'lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm',
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('return INVALID_PARAMS when invalid publicKey with interval', async () => {
			const response = await requestTransactionExport({
				publicKey: 'd517f9d9ac10a61b57d1959b88f8b5c6e8824d27a5349ec7ece44c4a027c4',
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
