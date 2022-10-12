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

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	blockAssetSchema,
} = require('../../../schemas/api_v3/block.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getBlocksAssets = async params => request(wsRpcUrl, 'get.blocks.assets', params);

describe('Method get.blocks.assets', () => {
	let refBlockAssets;
	let refAsset;
	beforeAll(async () => {
		[refBlockAssets] = (await getBlocksAssets({ height: '0' })).result.data;
		[refAsset] = refBlockAssets.assets;
	});

	describe('is able to retireve block assets', () => {
		it('no params -> ok', async () => {
			const response = await getBlocksAssets({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				if (i < result.data.length - 1) {
					expect(blockAssets.block.height)
						.toBeGreaterThanOrEqual(result.data[i + 1].block.height + 1);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('limit=10 -> ok', async () => {
			const response = await getBlocksAssets({ limit: 10 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				if (i < result.data.length - 1) {
					expect(blockAssets.block.height)
						.toBeGreaterThanOrEqual(result.data[i + 1].block.height + 1);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns block assets by blockID -> ok', async () => {
			const response = await getBlocksAssets({ blockID: refBlockAssets.block.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach((blockAssets) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.id).toEqual(refBlockAssets.block.id);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns block assets by height -> ok', async () => {
			const response = await getBlocksAssets({ height: `${refBlockAssets.block.height}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach((blockAssets) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.height).toEqual(refBlockAssets.block.height);
			});
		});

		it('returns block assets by module', async () => {
			const response = await getBlocksAssets({ module: refAsset.module });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			result.data.forEach((blockAssets) => {
				expect(blockAssets).toMap(blockAssetSchema);
				blockAssets.assets.forEach(asset => expect(asset.module).toEqual(refAsset.module));
			});
		});

		it('returns block assets by multiple modules', async () => {
			const modules = refBlockAssets.assets.map(asset => asset.module);
			const response = await getBlocksAssets({ module: modules.join(',') });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			result.data.forEach((blockAssets) => {
				expect(blockAssets).toMap(blockAssetSchema);
				blockAssets.assets.forEach(asset => expect(modules).toContain(asset.module));
			});
		});

		it('invalid blockID -> empty response', async () => {
			const response = await getBlocksAssets({ blockID: '12602944501676077162' }).catch(e => e);
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid query parameter -> -32602', async () => {
			const response = await getBlocksAssets({ block: '12602944501676077162' }).catch(e => e);
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retireve block assets by timestamp', () => {
		it('retusn blocks assets with from...to timestamp -> ok', async () => {
			const from = moment(refBlockAssets.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const to = refBlockAssets.block.timestamp;
			const response = await getBlocksAssets({ timestamp: `${from}:${to}`, limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.timestamp).toBeGreaterThanOrEqual(from);
				expect(blockAssets.block.timestamp).toBeLessThanOrEqual(to);
				if (i < result.data.length - 1) {
					expect(blockAssets.block.height)
						.toBeGreaterThanOrEqual(result.data[i + 1].block.height + 1);
				}
			});
		});

		it('returns blocks assets with from... timestamp -> ok', async () => {
			const from = moment(refBlockAssets.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const response = await getBlocksAssets({ timestamp: `${from}:`, limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.timestamp).toBeGreaterThanOrEqual(from);
				if (i < result.data.length - 1) {
					expect(blockAssets.block.height)
						.toBeGreaterThanOrEqual(result.data[i + 1].block.height + 1);
				}
			});
		});

		it('returns blocks assets with ...to timestamp -> ok', async () => {
			const to = refBlockAssets.block.timestamp;
			const response = await getBlocksAssets({ timestamp: `:${to}`, limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.timestamp).toBeLessThanOrEqual(to);
				if (i < result.data.length - 1) {
					expect(blockAssets.block.height)
						.toBeGreaterThanOrEqual(result.data[i + 1].block.height + 1);
				}
			});
		});
	});

	describe('is able to retireve block assets within height range', () => {
		it('return blocks assets with min...max height -> ok', async () => {
			const minHeight = refBlockAssets.block.height - 10;
			const maxHeight = refBlockAssets.block.height;
			const response = await getBlocksAssets({ height: `${minHeight}:${maxHeight}`, limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.height).toBeGreaterThanOrEqual(minHeight);
				expect(blockAssets.block.height).toBeLessThanOrEqual(maxHeight);
				if (i < result.data.length - 1) {
					expect(blockAssets.block.height)
						.toBeGreaterThanOrEqual(result.data[i + 1].block.height + 1);
				}
			});
		});

		it('returns blocks assets with min... height -> ok', async () => {
			const minHeight = refBlockAssets.block.height - 10;
			const response = await getBlocksAssets({ height: `${minHeight}:`, limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.height).toBeGreaterThanOrEqual(minHeight);
				if (i < result.data.length - 1) {
					expect(blockAssets.block.height)
						.toBeGreaterThanOrEqual(result.data[i + 1].block.height + 1);
				}
			});
		});

		it('Breturns blocks assets with ...max height -> ok', async () => {
			const maxHeight = refBlockAssets.block.height;
			const response = await getBlocksAssets({ height: `:${maxHeight}`, limit: 100 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(100);
			result.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.height).toBeLessThanOrEqual(maxHeight);
				if (i < result.data.length - 1) {
					expect(blockAssets.block.height)
						.toBeGreaterThanOrEqual(result.data[i + 1].block.height + 1);
				}
			});
		});
	});

	describe('Blocks assets sorted by height', () => {
		it('returns 10 blocks assets sorted by height descending', async () => {
			const response = await getBlocksAssets({ sort: 'height:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((blockAssets) => expect(blockAssets).toMap(blockAssetSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevBlockAsset = result.data[i - 1];
					const currBlockAsset = result.data[i];
					expect(prevBlockAsset.block.height).toBeGreaterThan(currBlockAsset.block.height);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 blocks assets sorted by height ascending', async () => {
			// Ignore the genesis block with offset=1
			const response = await getBlocksAssets({ sort: 'height:asc', offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((blockAssets) => expect(blockAssets).toMap(blockAssetSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevBlockAsset = result.data[i - 1];
					const currBlockAsset = result.data[i];
					expect(prevBlockAsset.block.height).toBeLessThan(currBlockAsset.block.height);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Blocks assets sorted by timestamp', () => {
		it('returns 10 blocks assets sorted by timestamp descending', async () => {
			const response = await getBlocksAssets({ sort: 'timestamp:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((blockAssets) => expect(blockAssets).toMap(blockAssetSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevBlockAsset = result.data[i - 1];
					const currBlockAsset = result.data[i];
					expect(prevBlockAsset.block.timestamp).toBeGreaterThan(currBlockAsset.block.timestamp);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});

		it('returns 10 blocks assets sorted by timestamp ascending', async () => {
			// Ignore the genesis block with offset=1
			const response = await getBlocksAssets({ sort: 'timestamp:asc', offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((blockAssets) => expect(blockAssets).toMap(blockAssetSchema));
			if (result.data.length > 1) {
				for (let i = 1; i < result.data.length; i++) {
					const prevBlockAsset = result.data[i - 1];
					const currBlockAsset = result.data[i];
					expect(prevBlockAsset.block.timestamp).toBeLessThan(currBlockAsset.block.timestamp);
				}
			}
			expect(result.meta).toMap(metaSchema);
		});
	});
});
