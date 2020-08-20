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
/* eslint-disable quotes, quote-props, comma-dangle */

import config from '../../config';
import request from '../../helpers/socketIoRpcRequest';
import block from './constants/blocks';

import { JSON_RPC } from '../../helpers/errorCodes';
import blockSchema from './schemas/block.schema';
import { invalidParamsSchema, emptyEnvelopeSchema } from './schemas/generics.schema';

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;
const getBlocks = async params => request(wsRpcUrl, 'get.blocks', params);

describe('Method get.blocks', () => {
	describe('is able to retireve block lists', () => {
		it.todo('no params -> ok');

		it('limit=100 -> ok', async () => {
			const { result } = await getBlocks({ limit: 100 });
			expect(result.data.length).toEqual(100);
			expect(result.data[0]).toMap(blockSchema);
		});

		it.todo('offset -> ok');

		it.todo('limit & offset -> ok');
	});

	describe('is able to retireve block details by block ID', () => {
		it('known block by block ID -> ok', async () => {
			const { result } = await getBlocks({ id: block.id });
			expect(result.data.length).toEqual(1);
			expect(result.data[0]).toMap(blockSchema, { id: block.id });
		});

		// To Do : current response is server error, does not get correct invalid params
		it('too long block id -> empty response', async () => {
			const { result } = await getBlocks({ id: 'fkfkfkkkffkfkfk1010101010101010101' }).catch(e => e);
			expect(result).toMap(invalidParamsSchema);
		});

		it('too short block id -> -32602', async () => {
			const { error } = await getBlocks({ id: '' }).catch(e => e);
			expect(error).toMap(invalidParamsSchema);
		});

		it('invalid block id -> empty response', async () => {
			const { result } = await getBlocks({ id: '12602944501676077162' }).catch(e => e);
			expect(result).toMap(emptyEnvelopeSchema);
		});

		it('invalid query parameter -> -32602', async () => {
			const { error } = await getBlocks({ block: '12602944501676077162' }).catch(e => e);
			expect(error).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retireve block details by height', () => {
		it('known block by height -> ok', async () => {
			const { result } = await getBlocks({ height: block.height });
			expect(result.data.length).toEqual(1);
			expect(result.data[0]).toMap(blockSchema, { height: block.height });
		});

		it('non-existent height -> empty response', async () => {
			const { result } = await getBlocks({ height: 2000000000 });
			expect(result).toMap(emptyEnvelopeSchema);
		});

		it('height = 0 -> -32602', async () => {
			const { error } = await getBlocks({ height: 0 }).catch(e => e);
			expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
		});

		it('empty height -> -32602 ', async () => {
			const { error } = await getBlocks({ limit: '' }).catch(e => e);
			expect(error).toMap(invalidParamsSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
		});
	});

	describe('is able to retireve block lists by account address', () => {
		it('block list by known account ID', async () => {
			const { result } = await getBlocks({ address: '9528507096611161860L' });
			result.data.forEach((blockData) => {
				expect(blockData).toMap(blockSchema, { generatorAddress: '9528507096611161860L' });
			});
		});

		it('block list by invalid account ID returns empty list', async () => {
			const { result } = await getBlocks({ address: '122233344455667L' });
			expect(result).toMap(emptyEnvelopeSchema);
		});
	});

	describe('is able to retireve block lists by account public key', () => {
		it('known block by publickey -> ok', async () => {
			const { result } = await getBlocks({ address: 'fab7b58be4c1e9542c342023b52e9d359ea89a3af34440bdb97318273e8555f0' });
			result.data.forEach((blockData) => {
				expect(blockData)
					.toMap(blockSchema, { generatorPublicKey: 'fab7b58be4c1e9542c342023b52e9d359ea89a3af34440bdb97318273e8555f0' });
			});
		});
	});

	describe('is able to retireve block lists by account username', () => {
		xit('known block by username -> ok', async () => {
			const { result } = await getBlocks({ address: 'genesis_71' });
			result.data.forEach((blockData) => {
				expect(blockData).toMap(blockSchema, { generatorUsername: 'genesis_71' });
			});
		});
	});

	describe('is able to retireve block lists by timestamp', () => {
		it('Blocks with from...to timestamp -> ok', async () => {
			const from = 1497855770;
			const to = 1497855780;
			const { result } = await getBlocks({ from, to });
			expect(result.data.length).toEqual(2);
			expect(result.data[0]).toMap(blockSchema);
			result.data.forEach((blockItem) => {
				expect(blockItem.timestamp).toBeGreaterThanOrEqual(from);
				expect(blockItem.timestamp).toBeLessThanOrEqual(to);
			});
		});
	});
});
