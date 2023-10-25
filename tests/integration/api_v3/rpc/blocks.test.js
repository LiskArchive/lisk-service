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
	invalidBlockIDs,
	invalidLimits,
	invalidOffsets,
} from '../constants/invalidInputs';
import { waitMs } from '../../../helpers/utils';

const util = require('util');

const config = require('../../../config');

const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const { blockSchema } = require('../../../schemas/api_v3/block.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getBlocks = async params => request(wsRpcUrl, 'get.blocks', params);

describe('Method get.blocks', () => {
	let refBlock;
	beforeAll(async () => {
		let retries = 10;
		let success = false;

		while (retries > 0 && !success) {
			try {
				[refBlock] = (await getBlocks({ limit: 1, offset: 5 })).result.data;

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

	describe('is able to retireve block lists', () => {
		it('should return list of blocks', async () => {
			const response = await getBlocks({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				if (i < result.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(result.data[i + 1].height + 1);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('should return list of blocks when requested with limit=10', async () => {
			const response = await getBlocks({ limit: 10 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				if (i < result.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(result.data[i + 1].height + 1);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('should return list of blocks when requested with offset=1', async () => {
			const [...topTenBlocks] = (await getBlocks({})).result.data;
			const [...topTenOffsetBlocks] = (await getBlocks({ offset: 1 })).result.data;

			[...Array(topTenBlocks.length)].forEach((_, i) => {
				if (i)
					expect(util.isDeepStrictEqual(topTenBlocks[i], topTenOffsetBlocks[i - 1])).toBeTruthy();
			});
		});

		it('should return list of blocks when requested with limit=12 and offset=1', async () => {
			const [...topTenBlocks] = (await getBlocks({})).result.data;
			const [...topTenOffsetBlocks] = (await getBlocks({ offset: 1, limit: 12 })).result.data;

			[...Array(topTenBlocks.length)].forEach((_, i) => {
				if (i)
					expect(util.isDeepStrictEqual(topTenBlocks[i], topTenOffsetBlocks[i - 1])).toBeTruthy();
			});
		});
	});

	describe('is able to retireve block details by block ID', () => {
		it('should return block by blockID', async () => {
			const response = await getBlocks({ blockID: refBlock.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(block => {
				expect(block).toMap(blockSchema, { id: refBlock.id });
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('should return invalid params if requested with invalid blockID', async () => {
			expect(
				await getBlocks({ blockID: 'fkfkfkkkffkfkfk1010101010101010101' }).catch(e => e),
			).toMap(invalidParamsSchema);
			expect(await getBlocks({ blockID: '12602944501676077162' }).catch(e => e)).toMap(
				invalidParamsSchema,
			);
		});

		it('shoudd return invalid query parameter for invalid param', async () => {
			const response = await getBlocks({ block: '12602944501676077162' }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return bad request when requested with invalid Addresse', async () => {
			for (let i = 0; i < invalidAddresses.length; i++) {
				const response = await getBlocks({ generatorAddress: invalidAddresses[i] }).catch(e => e);
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return bad request when requested with invalid limit', async () => {
			for (let i = 0; i < invalidLimits.length; i++) {
				const response = await getBlocks({ limit: invalidLimits[i] }).catch(e => e);
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return bad request when requested with offset', async () => {
			for (let i = 0; i < invalidOffsets.length; i++) {
				const response = await getBlocks({ offset: invalidOffsets[i] }).catch(e => e);
				expect(response).toMap(invalidParamsSchema);
			}
		});

		it('should return bad request when requested with invalid block ID', async () => {
			for (let i = 0; i < invalidBlockIDs.length; i++) {
				const response = await getBlocks({ blockID: invalidBlockIDs[i] }).catch(e => e);
				expect(response).toMap(invalidParamsSchema);
			}
		});
	});

	describe('is able to retireve block details by height', () => {
		it('should return known block by height', async () => {
			const response = await getBlocks({ height: `${refBlock.height}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(block => {
				expect(block).toMap(blockSchema, { height: refBlock.height });
			});
		});

		it('should return invalid params if requested with height=0', async () => {
			const response = await getBlocks({ height: 0 }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retireve block lists by generatorAddress', () => {
		it('should return block list by known generatorAddress', async () => {
			const response = await getBlocks({ generatorAddress: refBlock.generatorAddress });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.generatorAddress).toEqual(refBlock.generatorAddress);
				if (i < result.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(result.data[i + 1].height + 1);
				}
			});
		});
	});

	describe('is able to retireve block lists by timestamp', () => {
		it('should return blocks with from...to timestamp', async () => {
			const from = moment(refBlock.timestamp * 10 ** 3)
				.subtract(1, 'day')
				.unix();
			const to = refBlock.timestamp;
			const response = await getBlocks({ timestamp: `${from}:${to}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.timestamp).toBeGreaterThanOrEqual(from);
				expect(block.timestamp).toBeLessThanOrEqual(to);
				if (i < result.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(result.data[i + 1].height + 1);
				}
			});
		});

		it('should return blocks with from... timestamp', async () => {
			const from = moment(refBlock.timestamp * 10 ** 3)
				.subtract(1, 'day')
				.unix();
			const response = await getBlocks({ timestamp: `${from}:` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.timestamp).toBeGreaterThanOrEqual(from);
				if (i < result.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(result.data[i + 1].height + 1);
				}
			});
		});

		it('should return blocks with ...to timestamp', async () => {
			const to = refBlock.timestamp;
			const response = await getBlocks({ timestamp: `:${to}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.timestamp).toBeLessThanOrEqual(to);
				if (i < result.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(result.data[i + 1].height + 1);
				}
			});
		});
	});

	describe('is able to retireve block lists within height range', () => {
		it('should return blocks with min...max height', async () => {
			const minHeight = refBlock.height - 10;
			const maxHeight = refBlock.height;
			const response = await getBlocks({ height: `${minHeight}:${maxHeight}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.height).toBeGreaterThanOrEqual(minHeight);
				expect(block.height).toBeLessThanOrEqual(maxHeight);
				if (i < result.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(result.data[i + 1].height + 1);
				}
			});
		});

		it('should return blocks with min... height', async () => {
			const minHeight = refBlock.height - 10;
			const response = await getBlocks({ height: `${minHeight}:` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.height).toBeGreaterThanOrEqual(minHeight);
				if (i < result.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(result.data[i + 1].height + 1);
				}
			});
		});

		it('should return blocks with ...max height', async () => {
			const maxHeight = refBlock.height;
			const response = await getBlocks({ height: `:${maxHeight}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((block, i) => {
				expect(block).toMap(blockSchema);
				expect(block.height).toBeLessThanOrEqual(maxHeight);
				if (i < result.data.length - 1) {
					expect(block.height).toBeGreaterThanOrEqual(result.data[i + 1].height + 1);
				}
			});
		});
	});

	describe('Blocks sorted by height', () => {
		it('should return 10 blocks sorted by height descending', async () => {
			const response = await getBlocks({ sort: 'height:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(blockItem => expect(blockItem).toMap(blockSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevBlock = result.data[i - 1];
					const currBlock = result.data[i];
					expect(prevBlock.height).toBeGreaterThan(currBlock.height);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('should return 10 blocks sorted by height ascending', async () => {
			// Ignore the genesis block with offset=1
			const response = await getBlocks({ sort: 'height:asc', offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(blockItem => expect(blockItem).toMap(blockSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevBlock = result.data[i - 1];
					const currBlock = result.data[i];
					expect(prevBlock.height).toBeLessThan(currBlock.height);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Blocks sorted by timestamp', () => {
		it('should return 10 blocks sorted by timestamp descending', async () => {
			const response = await getBlocks({ sort: 'timestamp:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(blockItem => expect(blockItem).toMap(blockSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevBlock = result.data[i - 1];
					const currBlock = result.data[i];
					expect(prevBlock.timestamp).toBeGreaterThan(currBlock.timestamp);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('should return 10 blocks sorted by timestamp ascending', async () => {
			// Ignore the genesis block with offset=1
			const response = await getBlocks({ sort: 'timestamp:asc', offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(blockItem => expect(blockItem).toMap(blockSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevBlock = result.data[i - 1];
					const currBlock = result.data[i];
					expect(prevBlock.timestamp).toBeLessThan(currBlock.timestamp);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Fetch blocks based on multiple request params', () => {
		it('should return blocks by generatorAddress sorted by timestamp descending, limit & offset', async () => {
			const response = await getBlocks({
				generatorAddress: refBlock.generatorAddress,
				sort: 'timestamp:desc',
				limit: 100,
				offset: 0,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.forEach(blockItem => {
				expect(blockItem).toMap(blockSchema);
				expect(blockItem.generatorAddress).toEqual(refBlock.generatorAddress);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevBlock = result.data[i - 1];
					const currBlock = result.data[i];
					expect(prevBlock.timestamp).toBeGreaterThan(currBlock.timestamp);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('should return blocks by generatorAddress sorted by height ascending, limit & offset', async () => {
			const response = await getBlocks({
				generatorAddress: refBlock.generator.address,
				sort: 'height:asc',
				limit: 5,
				offset: 0,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
			result.data.forEach(blockItem => {
				expect(blockItem).toMap(blockSchema);
				expect(blockItem.generatorAddress).toEqual(refBlock.generatorAddress);
			});
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevBlock = result.data[i - 1];
					const currBlock = result.data[i];
					expect(prevBlock.height).toBeLessThan(currBlock.height);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('should return empty response when queried with blockID and wrong height', async () => {
			const height = String(refBlock.height - 10);
			const response = await getBlocks({ blockID: refBlock.id, height }).catch(e => e);
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('should return empty response when queried with blockID and wrong timestamp', async () => {
			const timestamp = String(
				moment(refBlock.timestamp * 10 ** 3)
					.subtract(1, 'day')
					.unix(),
			);
			const response = await getBlocks({ blockID: refBlock.id, timestamp }).catch(e => e);
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('should return empty response when queried with blockID and non-zero offset', async () => {
			const response = await getBlocks({ blockID: refBlock.id, offset: 1 }).catch(e => e);
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('should return empty response when queried with block height and non-zero offset', async () => {
			const response = await getBlocks({
				height: String(refBlock.height),
				offset: 1,
			}).catch(e => e);
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('should return empty response when queried with block timestamp and non-zero offset', async () => {
			const response = await getBlocks({ timestamp: String(refBlock.timestamp), offset: 1 }).catch(
				e => e,
			);
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});
});
