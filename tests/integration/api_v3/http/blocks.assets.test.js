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
const endpoint = `${baseUrlV3}/blocks/assets`;

const {
	goodRequestSchema,
	badRequestSchema,
	notFoundSchema,
	wrongInputParamSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	blockAssetSchema,
} = require('../../../schemas/api_v3/block.schema');

// TODO: Enable tests cases with the issue https://github.com/LiskHQ/lisk-service/issues/1089
xdescribe('Blocks Assets API', () => {
	let refBlockAssets;
	let refAsset;
	beforeAll(async () => {
		[refBlockAssets] = (await api.get(`${endpoint}?limit=1&offset=5`)).data;
		[refAsset] = refBlockAssets.assets;
	});

	describe('GET /blocks/assets', () => {
		it('returns list of blocks assets', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				if (i < response.data.length - 1) {
					expect(blockAssets.block.height).toBe(response.data[i + 1].block.height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns list of blocks assets when call with limit 10', async () => {
			const response = await api.get(`${endpoint}?limit=10`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				if (i < response.data.length - 1) {
					expect(blockAssets.block.height).toBe(response.data[i + 1].block.height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns block assets by moduleID -> ok', async () => {
			const response = await api.get(`${endpoint}?moduleID=${refAsset.moduleID}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap({ ...blockAssetSchema });
				blockAssets.assets.forEach(asset => expect(asset.moduleID).toEqual(refAsset.moduleID));
				if (i < response.data.length - 1) {
					expect(blockAssets.block.height).toBe(response.data[i + 1].block.height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns block assets by blockID -> ok', async () => {
			const response = await api.get(`${endpoint}?blockID=${refBlockAssets.block.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach((blockAssets) => {
				expect(blockAssets).toMap({ ...blockAssetSchema, blockID: refBlockAssets.block.id });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns block assets by height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=${refBlockAssets.block.height}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toEqual(1);
			response.data.forEach((blockAssets) => {
				expect(blockAssets).toMap({ ...blockAssetSchema, height: refBlockAssets.block.height });
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns block assets by timestamp -> ok', async () => {
			const response = await api.get(`${endpoint}?timestamp=${refBlockAssets.block.timestamp}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap({
					...blockAssetSchema, timestamp: refBlockAssets.block.timestamp,
				});
				if (i < response.data.length - 1) {
					expect(blockAssets.block.height).toBe(response.data[i + 1].block.height + 1);
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

	describe('Retrieve blocks assets within timestamps', () => {
		it('returns blocks assets within set timestamps are returned', async () => {
			const from = moment(refBlockAssets.block.timestamp * (10 ** 3)).subtract(1, 'day').unix();
			const toTimestamp = refBlockAssets.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=${from}:${toTimestamp}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.timestamp).toBeGreaterThanOrEqual(from);
				expect(blockAssets.block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i < response.data.length - 1) {
					expect(blockAssets.block.height).toBe(response.data[i + 1].block.height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns blocks assets with half bounded range: fromTimestamp', async () => {
			const from = moment(refBlockAssets.block.timestamp * (10 ** 3)).subtract(1, 'day').unix();
			const response = await api.get(`${endpoint}?timestamp=${from}:&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.timestamp).toBeGreaterThanOrEqual(from);
				if (i < response.data.length - 1) {
					expect(blockAssets.block.height).toBe(response.data[i + 1].block.height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns blocks assets with half bounded range: toTimestamp', async () => {
			const toTimestamp = refBlockAssets.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=:${toTimestamp}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.timestamp).toBeLessThanOrEqual(toTimestamp);
				if (i < response.data.length - 1) {
					expect(blockAssets.block.height).toBe(response.data[i + 1].block.height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve blocks assets within height range', () => {
		it('returns blocks assets within set height are returned', async () => {
			const minHeight = refBlockAssets.block.height - 10;
			const maxHeight = refBlockAssets.block.height;
			const response = await api.get(`${endpoint}?height=${minHeight}:${maxHeight}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.height).toBeGreaterThanOrEqual(minHeight);
				expect(blockAssets.block.height).toBeLessThanOrEqual(maxHeight);
				if (i < response.data.length - 1) {
					expect(blockAssets.block.height).toBe(response.data[i + 1].block.height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('return blocks assets with half bounded range: minHeight', async () => {
			const minHeight = refBlockAssets.block.height - 10;
			const response = await api.get(`${endpoint}?height=${minHeight}:&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.height).toBeGreaterThanOrEqual(minHeight);
				if (i < response.data.length - 1) {
					expect(blockAssets.block.height).toBe(response.data[i + 1].block.height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('return blocks assets with half bounded range: maxHeight', async () => {
			const maxHeight = refBlockAssets.block.height;
			const response = await api.get(`${endpoint}?height=:${maxHeight}&limit=100`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(100);
			response.data.forEach((blockAssets, i) => {
				expect(blockAssets).toMap(blockAssetSchema);
				expect(blockAssets.block.height).toBeLessThanOrEqual(maxHeight);
				if (i < response.data.length - 1) {
					expect(blockAssets.block.height).toBe(response.data[i + 1].block.height + 1);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Blocks assets sorted by height', () => {
		it('returns 10 blocks assets sorted by height descending', async () => {
			const response = await api.get(`${endpoint}?sort=height:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(blockAssets => expect(blockAssets).toMap(blockAssetSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevBlockAsset = response.data[i - 1];
					const currBlockAsset = response.data[i];
					expect(prevBlockAsset.block.height).toBeGreaterThan(currBlockAsset.block.height);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 blocks assets sorted by height ascending', async () => {
			// Ignore the genesis block with offset=1
			const response = await api.get(`${endpoint}?sort=height:asc&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(blockAssets => expect(blockAssets).toMap(blockAssetSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevBlockAsset = response.data[i - 1];
					const currBlockAsset = response.data[i];
					expect(prevBlockAsset.block.height).toBeLessThan(currBlockAsset.block.height);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Blocks assets sorted by timestamp', () => {
		it('returns 10 blocks assets sorted by timestamp descending', async () => {
			const response = await api.get(`${endpoint}?sort=timestamp:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(blockAssets => expect(blockAssets).toMap(blockAssetSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevBlockAsset = response.data[i - 1];
					const currBlockAsset = response.data[i];
					expect(prevBlockAsset.block.timestamp).toBeGreaterThan(currBlockAsset.block.timestamp);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 10 blocks asssets sorted by timestamp ascending', async () => {
			// Ignore the genesis block with offset=1
			const response = await api.get(`${endpoint}?sort=timestamp:asc&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(blockAssets => expect(blockAssets).toMap(blockAssetSchema));
			if (response.data.length > 1) {
				for (let i = 1; i < response.data.length; i++) {
					const prevBlockAsset = response.data[i - 1];
					const currBlockAsset = response.data[i];
					expect(prevBlockAsset.block.timestamp).toBeLessThan(currBlockAsset.block.timestamp);
				}
			}
			expect(response.meta).toMap(metaSchema);
		});
	});
});
