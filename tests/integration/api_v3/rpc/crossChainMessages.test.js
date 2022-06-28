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
import moment from 'moment';

const config = require('../../../config');
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	crossChainMessageSchema,
} = require('../../../schemas/api_v3/crossChainMessages.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getCCMs = async params => request(wsRpcUrl, 'get.ccm', params);
const getTransactions = async params => request(wsRpcUrl, 'get.transactions', params);

xdescribe('Method get.ccm', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await getTransactions({ moduleCommandID: '64:1', limit: 1 });
		[refTransaction] = response.result.data;
	});

	describe('Retrieve CCMs', () => {
		it('returns CCMs', async () => {
			const response = await getCCMs({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => expect(ccm).toMap(crossChainMessageSchema));
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('is able to retrieve ccm using transactionID', () => {
		it('known transactionID -> ok', async () => {
			const response = await getCCMs({ transactionID: refTransaction.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => expect(ccm)
				.toMap(crossChainMessageSchema, { id: refTransaction.id }));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty transactionID -> empty response', async () => {
			const response = await getCCMs({ transactionID: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve CCMs using moduleCommands', () => {
		it('known ccm moduleCommandID -> ok', async () => {
			const response = await getCCMs({ moduleCommandID: refTransaction.moduleCommandID });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => {
				expect(ccm)
					.toMap(crossChainMessageSchema, { moduleCommandID: refTransaction.moduleCommandID });
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('known ccm moduleCommandName -> ok', async () => {
			const response = await getCCMs({
				moduleCommandName: refTransaction.moduleCommandName,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => {
				expect(ccm)
					.toMap(crossChainMessageSchema, { moduleCommandName: refTransaction.moduleCommandName });
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid ccm moduleCommandID -> empty response', async () => {
			const response = await getCCMs({ moduleCommandID: '999' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty ccm moduleCommandID -> empty response', async () => {
			const response = await getCCMs({ moduleCommandID: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid ccm moduleCommandName -> empty response', async () => {
			const response = await getCCMs({ moduleCommandName: '999' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty ccm moduleCommandName -> empty response', async () => {
			const response = await getCCMs({ moduleCommandName: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve CCMs using senderAddress', () => {
		it('known senderAddress -> ok', async () => {
			const response = await getCCMs({ senderAddress: refTransaction.senderAddress });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => {
				expect(ccm).toMap(crossChainMessageSchema);
				expect(ccm.sender.address).toEqual(refTransaction.sender.address);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('empty senderAddress -> empty response', async () => {
			const response = await getCCMs({ senderAddress: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid senderAddress -> invalid params', async () => {
			const response = await getCCMs({ senderAddress: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve CCMs using timestamps', () => {
		it('from to -> ok', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const toTimestamp = refTransaction.block.timestamp;
			const response = await getCCMs({ timestamp: `${from}:${toTimestamp}` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => expect(ccm).toMap(crossChainMessageSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('Half bounded range from -> ok', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const response = await getCCMs({ timestamp: `${from}:` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => expect(ccm).toMap(crossChainMessageSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('Half bounded range to -> ok', async () => {
			const toTimestamp = refTransaction.block.timestamp;
			const response = await getCCMs({ timestamp: `:${toTimestamp}` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => expect(ccm).toMap(crossChainMessageSchema));
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('CCMs sorted by timestamp', () => {
		it('returns CCMs sorted by timestamp descending', async () => {
			const response = await getCCMs({ sort: 'timestamp:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => expect(ccm).toMap(crossChainMessageSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 CCMs sorted by timestamp ascending', async () => {
			const response = await getCCMs({ sort: 'timestamp:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => expect(ccm).toMap(crossChainMessageSchema));
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Fetch CCMs based on multiple request params', () => {
		it('returns CCMs with senderAddress and nonce', async () => {
			const response = await getCCMs({
				senderAddress: refTransaction.senderAddress,
				nonce: String(Number(refTransaction.nonce)),
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(ccm => {
				expect(ccm).toMap(crossChainMessageSchema);
				expect(ccm.sender.address).toBe(refTransaction.sender.address);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns invalid params response with senderAddress and nonce (incorrect data type)', async () => {
			const response = await getCCMs({
				senderAddress: refTransaction.senderAddress,
				nonce: Number(refTransaction.nonce) - 1,
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns invalid params response with unsupported params', async () => {
			const response = await getCCMs({
				address: refTransaction.senderAddress,
				nonce: String(Number(refTransaction.nonce)),
			});
			expect(response).toMap(invalidParamsSchema);
		});

		it('returns empty response when queried with transactionID and non-zero offset', async () => {
			const response = await getCCMs({ transactionID: refTransaction.id, offset: 1 });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('returns ccm when queried with limit and offset', async () => {
			const response = await getCCMs({ limit: 5, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
			result.data.forEach(ccm => expect(ccm).toMap(crossChainMessageSchema));
			expect(result.meta).toMap(metaSchema);
		});
	});
});
