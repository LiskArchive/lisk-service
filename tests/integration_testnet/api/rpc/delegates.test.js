/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
import config from '../../config';
import request from '../../helpers/socketIoRpcRequest';
import { JSON_RPC } from '../../helpers/errorCodes';
import delegates from './constants/delegates';
import {
	badRequestSchema, goodRequestSchema, delegateSchema, delegateListSchema, metaSchema,
} from '../../helpers/schemas';

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;

const getDelegates = async params => request(wsRpcUrl, 'get.delegates', params);

describe('Method get.delegates', () => {
	describe('returns delegates lists', () => {
		it('returns top 10 delegates by default', async () => {
			const { result } = await getDelegates();
			expect(result).toMap(goodRequestSchema);
			expect(result.meta).toMap(metaSchema, { count: 10, offset: 0 });
			expect(Object.keys(result.meta)).toEqual(Object.keys({ count: 10, offset: 0, total: 403 }));
			expect(result.data).toMap(delegateListSchema.length(10));
		});

		it('returns delegates matching search param', async () => {
			const limit = 100;
			const total = 13;
			const { result } = await getDelegates({ search: 'genesis_1', limit });
			expect(result).toMap(goodRequestSchema);
			expect(result.meta).toMap(metaSchema, { count: total, offset: 0 });
			expect(Object.keys(result.meta)).toEqual(Object.keys({ count: 10, offset: 0, total: 403 }));
			expect(result.data).toMap(delegateListSchema.length(total));
		});

		it('returns delegates matching search param and correct total', async () => {
			const limit = 10;
			// const total = 13;
			const { result } = await getDelegates({ search: 'genesis_1', limit });
			expect(result).toMap(goodRequestSchema);
			expect(result.meta).toMap(metaSchema, { count: limit, offset: 0 });
			expect(result.data).toMap(delegateListSchema.length(limit));
		});

		it('returns one result when limit = 1', async () => {
			const { result } = await getDelegates({ limit: 1 });
			expect(result.data[0]).toMap(delegateSchema);
			expect(result.data.length).toEqual(1);
		});

		it('is able to perform full-text search on delegates', async () => {
			const { result } = await getDelegates({ search: 'genesis' });
			expect(result.data[0]).toMap(delegateSchema);
			expect(result.data.length).toEqual(10);
			result.data.forEach(delegate => {
				expect(delegate.username).toInclude('genesis');
			});
		});
	});

	describe('returns delegates based on address', () => {
		it('returns known delegate by address', async () => {
			const { result } = await getDelegates({ address: delegates.activeDelegate.address });
			expect(result.data[0]).toMap(delegateSchema, { address: delegates.activeDelegate.address });
		});

		it('returns empty data ([]) when invalid address', async () => {
			const { result } = await getDelegates({ address: '412875216073141752800000' });
			expect(result).toMap(goodRequestSchema);
			expect(result.data).toBeArrayOfSize(0);
			expect(result.meta).toEqual({});
		});
	});

	describe('returns delegates based on username', () => {
		it('returns known delegate by username', async () => {
			const { result } = await getDelegates({ username: delegates.activeDelegate.username });
			expect(result.data[0]).toMap(delegateSchema, { address: delegates.activeDelegate.address });
		});

		it('returns empty data ([]) on wrong username', async () => {
			const response = await getDelegates({ username: 'genesis_510000000' });
			expect(response.result).toMap(goodRequestSchema);
			expect(response.result.data).toBeArrayOfSize(0);
			expect(response.result.meta).toEqual({});
		});
	});

	describe('returns delegates based on public key', () => {
		it('returns known delegate by public key', async () => {
			const { result } = await getDelegates({ publickey: delegates.activeDelegate.publicKey });
			expect(result.data[0]).toMap(delegateSchema, { address: delegates.activeDelegate.address });
		});

		it('returns empty object ({}) on wrong delegate public key', async () => {
			const response = await getDelegates({ publickey: '412875216073141752800000' });
			expect(response.result).toMap(goodRequestSchema);
			expect(response.result.data).toBeArrayOfSize(0);
			expect(response.result.meta).toEqual({});
		});
	});

	describe('returns INVALID_PARAMS', () => {
		// current response is -32600 as invalid parameter response
		it(`returns INVALID_PARAMS (${JSON_RPC.INVALID_REQUEST[0]}) when invalid param name`, async () => {
			const error = await getDelegates({ id: '412875216073141752800000' });
			expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_REQUEST[0] });
		});

		// current response is -32600 as invalid parameter response
		it(`returns INVALID_PARAMS error (${JSON_RPC.INVALID_REQUEST[0]}) with limit = 0`, async () => {
			const error = await getDelegates({ limit: 0 });
			expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_REQUEST[0] });
		});

		xit(`returns INVALID_PARAMS error (${JSON_RPC.INVALID_PARAMS[0]}) with empty limit ('')`, async () => {
			const error = await getDelegates({ limit: '' });
			expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
		});
	});
});
