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
import {
	invalidAddresses,
	invalidLimits,
	invalidBlockIDs,
	invalidOffsets,
} from '../constants/invalidInputs';
import { waitMs } from '../../../helpers/utils';

const config = require('../../../config');
const { api } = require('../../../helpers/api');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/blocks`;

const {
	goodRequestSchema,
	badRequestSchema,
	wrongInputParamSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const { blockSchema } = require('../../../schemas/api_v3/block.schema');

describe('Blocks API', () => {
	let refBlock;
	beforeAll(async () => {
		let retries = 10;
		let success = false;

		while (retries > 0 && !success) {
			try {
				[refBlock] = (await api.get(`${endpoint}?limit=1&offset=5`)).data;

				if (refBlock) {
					success = true;
				}
			} catch (error) {
				console.error(`Error fetching blocks. Retries left: ${retries}`);
				retries--;

				// Delay by 3 sec
				await waitMs(3000);
			}
		}

		if (!success) {
			throw new Error('Failed to fetch blocks even after retrying.');
		}
	});

	describe('GET /blocks', () => {
		it('should return list of blocks', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				if (i < response.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return list of blocks when requested with limit=10', async () => {
			const response = await api.get(`${endpoint}?limit=10`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				if (i < response.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return block by blockID', async () => {
			const response = await api.get(`${endpoint}?blockID=${refBlock.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach(block => {
				expect(block).toMap(blockSchema, { id: refBlock.id });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return block by height', async () => {
			const response = await api.get(`${endpoint}?height=${refBlock.height}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			expect(response.data[0].height).toEqual(refBlock.height);
			expect(response.data[0]).toEqual(refBlock);
			response.data.forEach(block => {
				expect(block).toMap(blockSchema, { height: refBlock.height });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return block by generatorAddress', async () => {
			const response = await api.get(`${endpoint}?generatorAddress=${refBlock.generator.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.generatorAddress).toEqual(refBlock.generatorAddress);
				if (i < response.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return block by timestamp', async () => {
			const response = await api.get(`${endpoint}?timestamp=${refBlock.timestamp}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(1);
			response.data.forEach(block => {
				expect(block).toMap(blockSchema, { timestamp: refBlock.timestamp });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return bad request when limit=0', async () => {
			const response = await api.get(`${endpoint}?limit=0`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return success when requested with non existant height', async () => {
			const response = await api.get(`${endpoint}?height=2000000000`);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return bad request when requested with invalid query parameter', async () => {
			const response = await api.get(`${endpoint}?generatorAddress=12602944501676077162`, 400);
			expect(response).toMap(wrongInputParamSchema);
		});

		it('should return bad request when requested with invalid Addresse', async () => {
			for (let i = 0; i < invalidAddresses.length; i++) {
				const response = await api.get(`${endpoint}?generatorAddress=${invalidAddresses[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request when requested with invalid limit', async () => {
			for (let i = 0; i < invalidLimits.length; i++) {
				const response = await api.get(`${endpoint}?limit=${invalidLimits[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request when requested with offset', async () => {
			for (let i = 0; i < invalidOffsets.length; i++) {
				const response = await api.get(`${endpoint}?offset=${invalidOffsets[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request when requested with invalid block ID', async () => {
			for (let i = 0; i < invalidBlockIDs.length; i++) {
				const response = await api.get(`${endpoint}?blockID=${invalidBlockIDs[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request when requested with invalid sort', async () => {
			const response = await api.get(`${endpoint}?sort=rank:asc`, 400);
			expect(response).toMap(wrongInputParamSchema);
		});
	});

	describe('Retrieve blocks list within timestamps', () => {
		it('should return blocks within set timestamps', async () => {
			const from = moment(refBlock.timestamp * 10 ** 3)
				.subtract(1, 'day')
				.unix();
			const toTimestamp = refBlock.timestamp;
			const response = await api.get(`${endpoint}?timestamp=${from}:${toTimestamp}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.timestamp).toBeGreaterThanOrEqual(from);
				expect(block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i < response.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return blocks with half bounded range: fromTimestamp', async () => {
			const from = moment(refBlock.timestamp * 10 ** 3)
				.subtract(1, 'day')
				.unix();
			const response = await api.get(`${endpoint}?timestamp=${from}:`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.timestamp).toBeGreaterThanOrEqual(from);
				if (i < response.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return blocks with half bounded range: toTimestamp', async () => {
			const toTimestamp = refBlock.timestamp;
			const response = await api.get(`${endpoint}?timestamp=:${toTimestamp}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i < response.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve blocks list within height range', () => {
		it('should return blocks within set height are returned', async () => {
			const minHeight = refBlock.height - 10;
			const maxHeight = refBlock.height;
			const response = await api.get(`${endpoint}?height=${minHeight}:${maxHeight}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.height).toBeGreaterThanOrEqual(minHeight);
				expect(block.height).toBeLessThanOrEqual(maxHeight);
				if (i < response.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return blocks with half bounded range: minHeight', async () => {
			const minHeight = refBlock.height - 10;
			const response = await api.get(`${endpoint}?height=${minHeight}:`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.height).toBeGreaterThanOrEqual(minHeight);
				if (i < response.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('should return blocks with half bounded range: maxHeight', async () => {
			const maxHeight = refBlock.height;
			const response = await api.get(`${endpoint}?height=:${maxHeight}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.height).toBeLessThanOrEqual(maxHeight);
				if (i < response.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(response.data[i + 1].height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Blocks sorted by height', () => {
		it('should return 10 blocks sorted by height descending', async () => {
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

		it('should return 10 blocks sorted by height ascending', async () => {
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
		it('should return 10 blocks sorted by timestamp descending', async () => {
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

		it('should return 10 blocks sorted by timestamp ascending', async () => {
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
		it('should return blocks by generatorAddress sorted by timestamp descending, limit & offset', async () => {
			const response = await api.get(
				`${endpoint}?generatorAddress=${refBlock.generator.address}&sort=timestamp:desc&limit=100`,
			);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
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

		it('should return blocks by generatorAddress sorted by height ascending, limit & offset', async () => {
			const response = await api.get(
				`${endpoint}?generatorAddress=${refBlock.generator.address}&sort=height:asc&limit=5`,
			);
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

		it('should return 200 OK when queried with invalid combination: blockID and wrong height', async () => {
			const height = refBlock.height - 10;
			const response = await api.get(`${endpoint}?blockID=${refBlock.id}&height=${height}`);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return 200 OK when queried with invalid combination: blockID and wrong timestamp', async () => {
			const timestamp = moment(refBlock.timestamp * 10 ** 3)
				.subtract(1, 'day')
				.unix();
			const response = await api.get(`${endpoint}?blockID=${refBlock.id}&timestamp=${timestamp}`);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return 200 OK when queried with blockID and non-zero offset', async () => {
			const response = await api.get(`${endpoint}?blockID=${refBlock.id}&offset=1`);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return 200 OK when queried with block height and non-zero offset', async () => {
			const response = await api.get(`${endpoint}?height=${refBlock.height}&offset=1`);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});

		it('should return 200 OK when queried with block timestamp and non-zero offset', async () => {
			const response = await api.get(`${endpoint}?timestamp=${refBlock.timestamp}&offset=1`);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBe(0);
			expect(response.meta).toMap(metaSchema);
		});
	});
});
