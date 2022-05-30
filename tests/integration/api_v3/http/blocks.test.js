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

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/blocks`;

const {
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	wrongInputParamSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	blockSchema,
} = require('../../../schemas/api_v3/block.schema');

describe('Blocks API', () => {
	let refBlock;
	beforeAll(async () => {
		[refBlock] = (await api.get(`${endpoint}?limit=1&offset=5`)).data;
	});

	describe('GET /blocks', () => {
		it('returns list of blocks', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns list of blocks when call with limit 10', async () => {
			const response = await api.get(`${endpoint}?limit=10`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('known block by blockID -> ok', async () => {
			const response = await api.get(`${endpoint}?blockID=${refBlock.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(1);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema, { id: refBlock.id });
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('known block by height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=${refBlock.height}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data.length).toEqual(1);
			expect(response.data[0].height).toEqual(refBlock.height);
			expect(response.data[0]).toEqual(refBlock);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema, { height: refBlock.height });
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('known block by generatorAddress -> ok', async () => {
			const response = await api.get(`${endpoint}?generatorAddress=${refBlock.generatorAddress}`);
			expect(response).toMap(goodRequestSchema);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.generatorAddress).toEqual(refBlock.generatorAddress);
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('known block by timestamp -> ok', async () => {
			const response = await api.get(`${endpoint}?timestamp=${refBlock.timestamp}`);
			expect(response).toMap(goodRequestSchema);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema, { timestamp: refBlock.timestamp });
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('limit=0 -> 400', async () => {
			const response = await api.get(`${endpoint}?limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('non-existent height -> 404', async () => {
			const response = await api.get(`${endpoint}?height=2000000000`, 404);
			expect(response).toMap(notFoundSchema);
		});

		it('invalid query parameter -> 400', async () => {
			const response = await api.get(`${endpoint}?block=12602944501676077162`, 400);
			expect(response).toMap(wrongInputParamSchema);
		});
	});

	describe('Retrieve blocks list within timestamps', () => {
		it('blocks within set timestamps are returned', async () => {
			const from = moment(refBlock.timestamp * (10 ** 3)).subtract(1, 'day').unix();
			const toTimestamp = refBlock.timestamp;
			const response = await api.get(`${endpoint}?timestamp=${from}:${toTimestamp}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.timestamp).toBeGreaterThanOrEqual(from);
				expect(block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('blocks with half bounded range: fromTimestamp', async () => {
			const from = moment(refBlock.timestamp * (10 ** 3)).subtract(1, 'day').unix();
			const response = await api.get(`${endpoint}?timestamp=${from}:&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.timestamp).toBeGreaterThanOrEqual(from);
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('blocks with half bounded range: toTimestamp', async () => {
			const toTimestamp = refBlock.timestamp;
			const response = await api.get(`${endpoint}?timestamp=:${toTimestamp}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve blocks list within height range', () => {
		it('blocks within set height are returned', async () => {
			const minHeight = refBlock.height - 10;
			const maxHeight = refBlock.height;
			const response = await api.get(`${endpoint}?height=${minHeight}:${maxHeight}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.height).toBeGreaterThanOrEqual(minHeight);
				expect(block.height).toBeLessThanOrEqual(maxHeight);
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('blocks with half bounded range: minHeight', async () => {
			const minHeight = refBlock.height - 10;
			const response = await api.get(`${endpoint}?height=${minHeight}:&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.height).toBeGreaterThanOrEqual(minHeight);
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('blocks with half bounded range: maxHeight', async () => {
			const maxHeight = refBlock.height;
			const response = await api.get(`${endpoint}?height=:${maxHeight}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.height).toBeLessThanOrEqual(maxHeight);
				if (i < response.data.length - 1) {
					expect(block.height).toBe(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Blocks sorted by height', () => {
		it('returns 10 blocks sorted by height descending', async () => {
			const response = await api.get(`${endpoint}?sort=height:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevBlock = response.data[i - 1];
					const currBlock = response.data[i];
					expect(prevBlock.height).toBeGreaterThan(currBlock.height);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 blocks sorted by height ascending', async () => {
			// Ignore the genesis block with offset=1
			const response = await api.get(`${endpoint}?sort=height:asc&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevBlock = response.data[i - 1];
					const currBlock = response.data[i];
					expect(prevBlock.height).toBeLessThan(currBlock.height);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Blocks sorted by timestamp', () => {
		it('returns 10 blocks sorted by timestamp descending', async () => {
			const response = await api.get(`${endpoint}?sort=timestamp:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevBlock = response.data[i - 1];
					const currBlock = response.data[i];
					expect(prevBlock.timestamp).toBeGreaterThan(currBlock.timestamp);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 blocks sorted by timestamp ascending', async () => {
			// Ignore the genesis block with offset=1
			const response = await api.get(`${endpoint}?sort=timestamp:asc&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(block => expect(block).toMap(blockSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevBlock = response.data[i - 1];
					const currBlock = response.data[i];
					expect(prevBlock.timestamp).toBeLessThan(currBlock.timestamp);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Fetch blocks based on multiple request params', () => {
		it('returns blocks by generatorAddress sorted by timestamp descending, limit & offset', async () => {
			const response = await api.get(`${endpoint}?generatorAddress=${refBlock.generatorAddress}&sort=timestamp:desc&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
			response.data.forEach(block => {
				expect(block).toMap(blockSchema);
				expect(block.generatorAddress).toEqual(refBlock.generatorAddress);
			});
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevBlock = response.data[i - 1];
					const currBlock = response.data[i];
					expect(prevBlock.timestamp).toBeGreaterThan(currBlock.timestamp);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns blocks by generatorAddress sorted by height ascending, limit & offset', async () => {
			const response = await api.get(`${endpoint}?generatorAddress=${refBlock.generatorAddress}&sort=height:asc&limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
			response.data.forEach(block => {
				expect(block).toMap(blockSchema);
				expect(block.generatorAddress).toEqual(refBlock.generatorAddress);
			});
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevBlock = response.data[i - 1];
					const currBlock = response.data[i];
					expect(prevBlock.height).toBeLessThan(currBlock.height);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 404 NOT FOUND when queried with invalid combination: blockID and wrong height', async () => {
			const expectedStatus = 404;
			const height = refBlock.height - 10;
			const response = await api.get(`${endpoint}?blockID=${refBlock.id}&height=${height}`, expectedStatus);
			expect(response).toMap(notFoundSchema);
		});

		it('returns 404 NOT FOUND when queried with invalid combination: blockID and wrong timestamp', async () => {
			const expectedStatus = 404;
			const timestamp = moment(refBlock.timestamp * (10 ** 3)).subtract(1, 'day').unix();
			const response = await api.get(`${endpoint}?blockID=${refBlock.id}&timestamp=${timestamp}`, expectedStatus);
			expect(response).toMap(notFoundSchema);
		});

		it('returns 404 NOT FOUND when queried with blockID and non-zero offset', async () => {
			const expectedStatus = 404;
			const response = await api.get(`${endpoint}?blockID=${refBlock.id}&offset=1`, expectedStatus);
			expect(response).toMap(notFoundSchema);
		});

		it('returns 404 NOT FOUND when queried with block height and non-zero offset', async () => {
			const expectedStatus = 404;
			const response = await api.get(`${endpoint}?height=${refBlock.height}&offset=1`, expectedStatus);
			expect(response).toMap(notFoundSchema);
		});

		it('returns 404 NOT FOUND when queried with block timestamp and non-zero offset', async () => {
			const expectedStatus = 404;
			const response = await api.get(`${endpoint}?timestamp=${refBlock.timestamp}&offset=1`, expectedStatus);
			expect(response).toMap(notFoundSchema);
		});
	});
});
