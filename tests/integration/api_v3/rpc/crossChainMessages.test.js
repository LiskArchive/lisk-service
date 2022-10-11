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
	let refCCM;
	let refTransaction;
	beforeAll(async () => {
		const response1 = await getCCMs({ limit: 1 });
		[refCCM] = response1.result.data;

		const response2 = await getTransactions({ transactionID: refCCM.block.transactionID });
		[refTransaction] = response2.result.data;
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
			result.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = result.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('is able to retrieve ccm using transactionID', () => {
		it('known transactionID -> ok', async () => {
			const response = await getCCMs({ transactionID: refCCM.block.transactionID });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => {
				expect(ccm).toMap(crossChainMessageSchema);
				expect(ccm.block.transactionID).toEqual(refCCM.block.transactionID);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('empty transactionID -> empty response', async () => {
			const response = await getCCMs({ transactionID: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve ccm using CCM ID', () => {
		it('known id -> ok', async () => {
			const response = await getCCMs({ id: refCCM.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm) => expect(ccm).toMap(crossChainMessageSchema, { id: refCCM.id }));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty id -> empty response', async () => {
			const response = await getCCMs({ id: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve CCMs using moduleCrossChainCommands', () => {
		it('known ccm moduleCrossChainCommand -> ok', async () => {
			const response = await getCCMs({
				moduleCrossChainCommand: refCCM.moduleCrossChainCommand,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema,
					{ moduleCrossChainCommand: refCCM.moduleCrossChainCommand });
				if (i > 0) {
					const prevCCM = result.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('invalid ccm moduleCrossChainCommand -> empty response', async () => {
			const response = await getCCMs({ moduleCrossChainCommand: '999' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty ccm moduleCrossChainCommand -> empty response', async () => {
			const response = await getCCMs({ moduleCrossChainCommand: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid ccm moduleCrossChainCommand -> empty response', async () => {
			const response = await getCCMs({ moduleCrossChainCommand: '999' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('empty ccm moduleCrossChainCommand -> empty response', async () => {
			const response = await getCCMs({ moduleCrossChainCommand: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve CCMs using senderAddress', () => {
		it('known senderAddress -> ok', async () => {
			const response = await getCCMs({ senderAddress: refTransaction.sender.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = result.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
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
			const from = moment(refCCM.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const toTimestamp = refCCM.block.timestamp;
			const response = await getCCMs({ timestamp: `${from}:${toTimestamp}` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				expect(ccm.block.timestamp).toBeGreaterThanOrEqual(from);
				expect(ccm.block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i > 0) {
					const prevCCM = result.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
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
			result.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				expect(ccm.block.timestamp).toBeGreaterThanOrEqual(from);
				if (i > 0) {
					const prevCCM = result.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
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
			result.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				expect(ccm.block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i > 0) {
					const prevCCM = result.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
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
			result.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = result.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
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
			result.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = result.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeLessThanOrEqual(ccm.block.timestamp);
				}
			});
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
			result.data.forEach(ccm => expect(ccm).toMap(crossChainMessageSchema));
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
			result.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = result.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});
});
