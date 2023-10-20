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
const { request } = require('../../../helpers/socketIoRpcRequest');
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
const requestTransactionExport = async params =>
	request(wsRpcUrl, 'get.export.transactions', params);

describe('Export API', () => {
	const startDate = moment('2023-01-10').format(exportConfig.excel.dateFormat);
	const endDate = moment('2023-12-30').format(exportConfig.excel.dateFormat);

	const mockAddress = 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad';
	const mockPublicKey = '44e2b746594f74272d15b6f7d18dffbf83c749bbf1babc5f1d314bdbd08f8215';

	describe('Schedule file export', () => {
		it('should schedule file export from account address with interval', async () => {
			const expected = { ready: false };
			const response = await requestTransactionExport({
				address: mockAddress,
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;

			expect(result).toMap(goodRequestSchemaForExport);
			expect(result.data).toMap(exportSchemaAccepted);
			expect(result.meta).toMap(metaSchemaForExport);
			expect(result.meta).toEqual(expect.objectContaining(expected));
		});

		it('should schedule file export from account publicKey with interval', async () => {
			const expected = { ready: false };
			const response = await requestTransactionExport({
				publicKey: mockPublicKey,
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
		const successValidator = response => response.result.meta.ready;

		it('should schedule from account address and confirm it is ready', async () => {
			const scheduleExport = async () =>
				requestTransactionExport({
					address: mockAddress,
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
		}, 2147483647);

		it('should schedule from account publicKey and confirm it is ready', async () => {
			const scheduleExport = async () =>
				requestTransactionExport({
					publicKey: mockPublicKey,
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
		}, 2147483647);
	});

	describe('Invalid params/request', () => {
		it('should return INVALID_REQUEST when no address', async () => {
			const response = await requestTransactionExport();
			expect(response).toMap(invalidRequestSchema);
		});

		it('should return INVALID_PARAMS when invalid address', async () => {
			const response = await requestTransactionExport({
				address: 'lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm',
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return INVALID_PARAMS when invalid publicKey', async () => {
			const response = await requestTransactionExport({
				publicKey: 'd517f9d9ac10a61b57d1959b88f8b5c6e8824d27a5349ec7ece44c4a027c4',
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return INVALID_PARAMS when address with invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await requestTransactionExport({
				address: mockAddress,
				interval: invalidInterval,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return INVALID_PARAMS when publicKey with invalid interval', async () => {
			const invalidInterval = '20-10-2021:20-11-2021';
			const response = await requestTransactionExport({
				publicKey: mockPublicKey,
				interval: invalidInterval,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return INVALID_PARAMS when invalid address with interval', async () => {
			const response = await requestTransactionExport({
				address: 'lsknww5x4dv93x3euds4w72d99ouwnqojyw5qrm',
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return INVALID_PARAMS when invalid publicKey with interval', async () => {
			const response = await requestTransactionExport({
				publicKey: 'd517f9d9ac10a61b57d1959b88f8b5c6e8824d27a5349ec7ece44c4a027c4',
				interval: `${startDate}:${endDate}`,
			});
			expect(response).toMap(invalidParamsSchema);
		});
	});
});
