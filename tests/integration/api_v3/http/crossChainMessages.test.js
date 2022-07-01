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
const { api } = require('../../../helpers/api');

const {
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	crossChainMessageSchema,
} = require('../../../schemas/api_v3/crossChainMessages.schema');

const baseAddress = config.SERVICE_ENDPOINT;
const baseUrl = `${baseAddress}/api/v3`;
const endpoint = `${baseUrl}/ccm`;

// TODO: Enable once Lisk Core is updated
xdescribe('Cross-chain Messages API', () => {
	let refCCM;
	let refTransaction;
	beforeAll(async () => {
		const response1 = await api.get(`${endpoint}?limit=1`);
		[refCCM] = response1.data;

		const response2 = await api.get(`${baseUrl}/transactions?transactionID=${refCCM.block.transactionID}`);
		refTransaction = response2.data;
	});

	describe('Retrieve Cross-chain Messages', () => {
		it('returns list of CCMs', async () => {
			const response = await api.get(endpoint);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = response.data[i - 1];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns CCMS with known moduleCrossChainCommandID', async () => {
			const response = await api.get(`${endpoint}?moduleCrossChainCommandID=${refCCM.moduleCrossChainCommandID}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema,
					{ moduleCrossChainCommandID: refCCM.moduleCrossChainCommandID });
				if (i > 0) {
					const prevCCM = response.data[i - 1];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns CCMS with known moduleCrossChainCommandName', async () => {
			const response = await api.get(`${endpoint}?moduleCrossChainCommandName=${refCCM.moduleCrossChainCommandName}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema,
					{ moduleCrossChainCommandName: refCCM.moduleCrossChainCommandName });
				if (i > 0) {
					const prevCCM = response.data[i - 1];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid moduleCrossChainCommandID -> 404', async () => {
			const response = await api.get(`${endpoint}?moduleCrossChainCommandID=-124`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('empty moduleCrossChainCommandID ->  ok', async () => {
			const response = await api.get(`${endpoint}?moduleCrossChainCommandID=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = response.data[i - 1];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve a CCM by transactionID', () => {
		it('returns CCM with known transactionID', async () => {
			const response = await api.get(`${endpoint}?transactionID=${refCCM.block.transactionID}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach((ccm) => {
				expect(ccm).toMap(crossChainMessageSchema);
				expect(ccm.block.transactionID).toEqual(refCCM.block.transactionID);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty transactionID -> ok', async () => {
			const response = await api.get(`${endpoint}?transactionID=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = response.data[i - 1];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('long invalid transactionID -> 400 BAD REQUEST', async () => {
			const response = await api.get(`${endpoint}?transactionID=a0833fb5b5534a0c53c3a766bf356c92df2a28e1730fba85667b24f139f65b35578`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('short invalid transactionID -> 400 BAD REQUEST', async () => {
			const response = await api.get(`${endpoint}?transactionID=41287`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve a CCM by CCM ID', () => {
		it('returns CCM with known id', async () => {
			const response = await api.get(`${endpoint}?id=${refCCM.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeArrayOfSize(1);
			response.data.forEach((ccm) => expect(ccm).toMap(crossChainMessageSchema, { id: refCCM.id }));
			expect(response.meta).toMap(metaSchema);
		});

		it('empty id -> ok', async () => {
			const response = await api.get(`${endpoint}?id=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = response.data[i - 1];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid id -> 400 BAD REQUEST', async () => {
			const response = await api.get(`${endpoint}?id=invalid_id`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve CCMS list by senderAddress', () => {
		it('known senderAddress -> ok', async () => {
			const response = await api.get(`${endpoint}?senderAddress=${refTransaction.sender.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = response.data[i - 1];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty senderAddress -> ok', async () => {
			const response = await api.get(`${endpoint}?senderAddress=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = response.data[i - 1];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid senderAddress -> 400', async () => {
			const response = await api.get(`${endpoint}?senderAddress=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve CCMS list within timestamps', () => {
		it('CCMS within set timestamps are returned', async () => {
			const from = moment(refCCM.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const toTimestamp = refCCM.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=${from}:${toTimestamp}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				expect(ccm.block.timestamp).toBeGreaterThanOrEqual(from);
				expect(ccm.block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i > 0) {
					const prevCCM = response.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('CCMS with half bounded range: fromTimestamp', async () => {
			const from = moment(refCCM.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const response = await api.get(`${endpoint}?timestamp=${from}:`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				expect(ccm.block.timestamp).toBeGreaterThanOrEqual(from);
				if (i > 0) {
					const prevCCM = response.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('CCMS with half bounded range: toTimestamp', async () => {
			const toTimestamp = refCCM.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=:${toTimestamp}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				expect(ccm.block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i > 0) {
					const prevCCM = response.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('CCMS sorted by timestamp', () => {
		it('returns 10 CCMS sorted by timestamp descending', async () => {
			const response = await api.get(`${endpoint}?sort=timestamp:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = response.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 CCMS sorted by timestamp ascending', async () => {
			const response = await api.get(`${endpoint}?sort=timestamp:asc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((ccm, i) => {
				expect(ccm).toMap(crossChainMessageSchema);
				if (i > 0) {
					const prevCCM = response.data[i];
					const prevCCMTimestamp = prevCCM.block.timestamp;
					expect(prevCCMTimestamp).toBeLessThanOrEqual(ccm.block.timestamp);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Fetch CCMS based on multiple request params', () => {
		it('returns CCMS with senderAddress and nonce', async () => {
			const response = await api.get(`${endpoint}?senderAddress=${refTransaction.sender.address}&nonce=${Number(refTransaction.nonce)}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach(ccm => expect(ccm).toMap(crossChainMessageSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 400 BAD REQUEST with unsupported params', async () => {
			const expectedStatusCode = 400;
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}&nonce=${Number(refTransaction.nonce) - 1}`, expectedStatusCode);
			expect(response).toMap(badRequestSchema);
		});

		it('returns 404 NOT FOUND when queried with transactionID and non-zero offset', async () => {
			const expectedStatusCode = 404;
			const response = await api.get(`${endpoint}?transactionID=${refTransaction.id}&offset=1`, expectedStatusCode);
			expect(response).toMap(notFoundSchema);
		});

		it('returns CCMS when queried with limit and offset', async () => {
			try {
				const response = await api.get(`${endpoint}?limit=5&offset=1`);
				expect(response).toMap(goodRequestSchema);
				expect(response.data).toBeInstanceOf(Array);
				expect(response.data.length).toBeGreaterThanOrEqual(1);
				expect(response.data.length).toBeLessThanOrEqual(5);
				response.data.forEach((ccm, i) => {
					expect(ccm).toMap(crossChainMessageSchema);
					if (i > 0) {
						const prevCCM = response.data[i - 1];
						const prevCCMTimestamp = prevCCM.block.timestamp;
						expect(prevCCMTimestamp).toBeGreaterThanOrEqual(ccm.block.timestamp);
					}
				});
				expect(response.meta).toMap(metaSchema);
			} catch (_) {
				const expectedStatusCode = 404;
				const response = await api.get(`${endpoint}?limit=5&offset=1`, expectedStatusCode);
				expect(response).toMap(notFoundSchema);
			}
		});
	});
});
