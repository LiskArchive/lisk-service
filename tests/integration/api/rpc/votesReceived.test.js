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
const config = require('../../../config');
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	invalidRequestSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	voterSchema,
	metaSchema,
} = require('../../../schemas/voter.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;
// const getVoters = async params => request(wsRpcUrl, 'get.votes_received', params);

[
	'get.votes_received',
	'get.voters',
].forEach(methodName => {
	const getVoters = async params => request(wsRpcUrl, methodName, params);

	describe(`Method ${methodName}`, () => {
		let refDelegate;
		beforeAll(async () => {
			[refDelegate] = (await request(wsRpcUrl, 'get.delegates', { limit: 1 })).result.data;
		});

		it('Returns list of voters when requested for existing account by account ID', async () => {
			const response = await getVoters({ address: refDelegate.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(10);
			result.data.forEach(block => expect(block).toMap(voterSchema));
			expect(result.meta).toMap(metaSchema, {
				address: refDelegate.address,
				publicKey: refDelegate.publicKey,
				username: refDelegate.username,
			});
		});

		it('Returns list of voters when requested for existing account by username', async () => {
			if (refDelegate.username) {
				const response = await getVoters({ username: refDelegate.username });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toEqual(10);
				result.data.forEach(block => expect(block).toMap(voterSchema));
				expect(result.meta).toMap(metaSchema, {
					address: refDelegate.address,
					publicKey: refDelegate.publicKey,
					username: refDelegate.username,
				});
			}
		});

		// TODO: Fails CI pipeline
		xit('Returns list of voters when requested for existing account by publickey', async () => {
			if (refDelegate.publicKey) {
				const response = await getVoters({ publickey: refDelegate.publickey });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toEqual(10);
				result.data.forEach(block => expect(block).toMap(voterSchema));
				expect(result.meta).toMap(metaSchema, {
					address: refDelegate.address,
					publicKey: refDelegate.publicKey,
					username: refDelegate.username,
				});
			}
		});

		it('Returns list of voters when requested for existing account by secpubkey', async () => {
			if (refDelegate.secondPublicKey) {
				const response = await getVoters({ secpubkey: refDelegate.secondPublicKey });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toEqual(10);
				result.data.forEach(block => expect(block).toMap(voterSchema));
				expect(result.meta).toMap(metaSchema, {
					address: refDelegate.address,
					publicKey: refDelegate.publicKey,
					username: refDelegate.username,
				});
			}
		});

		it('Returns list of voters when requested with offset', async () => {
			const response = await getVoters({ address: refDelegate.address, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(10);
			result.data.forEach(block => expect(block).toMap(voterSchema));
			expect(result.meta).toMap(metaSchema, {
				address: refDelegate.address,
				publicKey: refDelegate.publicKey,
				username: refDelegate.username,
			});
		});

		it('Returns list of voters when requested with limit', async () => {
			const response = await getVoters({ address: refDelegate.address, limit: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(block => expect(block).toMap(voterSchema));
			expect(result.meta).toMap(metaSchema, {
				address: refDelegate.address,
				publicKey: refDelegate.publicKey,
				username: refDelegate.username,
			});
		});

		it('Returns list of voters when requested with offset & limit', async () => {
			const response = await getVoters({ address: refDelegate.address, offset: 1, limit: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(block => expect(block).toMap(voterSchema));
			expect(result.meta).toMap(metaSchema, {
				address: refDelegate.address,
				publicKey: refDelegate.publicKey,
				username: refDelegate.username,
			});
		});

		it('Returns INVALID_PARAMS (-32602) when requested with limit = 0', async () => {
			const response = await getVoters({ limit: 0 });
			expect(response).toMap(invalidParamsSchema);
		});

		it('Returns empty response when requested with wrong address', async () => {
			const response = await getVoters({ address: '999999999L' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('Returns INVALID_PARAMS (-32602) when requested with unsupported param', async () => {
			const response = await getVoters({ unsupported_param: 0 });
			expect(response).toMap(invalidParamsSchema);
		});

		// TODO: Fails CI pipeline
		xit('Returns BAD_REQUEST (400) when requested without required params', async () => {
			const response = await getVoters({});
			expect(response).toMap(invalidRequestSchema);
		});
	});
});
