/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	voterSchemaVersion5,
} = require('../../../schemas/api_v2/voter.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
// const getVoters = async params => request(wsRpcUrl, 'get.votes_received', params);

[
	'get.votes_received',
].forEach(methodName => {
	const getVoters = async params => request(wsRpcUrl, methodName, params);

	describe(`Method ${methodName}`, () => {
		let refDelegate;
		let refDelegateAddress;
		beforeAll(async () => {
			do {
				// eslint-disable-next-line no-await-in-loop
				const response1 = await request(wsRpcUrl, 'get.transactions', { moduleAssetId: '5:1', limit: 1 });
				const { data: [voteTx] = [] } = response1.result;
				if (voteTx) {
					// Destructure to refer first entry of all the sent votes within the transaction
					const { asset: { votes: [vote] } } = voteTx;
					refDelegateAddress = vote.delegateAddress;
				}
			} while (!refDelegateAddress);
			const response2 = await request(wsRpcUrl, 'get.accounts', { address: refDelegateAddress });
			[refDelegate] = response2.result.data;
		});

		it('Returns list of voters when requested for existing account by account ID', async () => {
			const response = await getVoters({ address: refDelegate.summary.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(voterSchemaVersion5);
			expect(result.meta).toMap(metaSchema);
		});

		it('Returns list of voters when requested for existing account by username', async () => {
			if (refDelegate.summary.username) {
				const response = await getVoters({ username: refDelegate.summary.username });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toMap(voterSchemaVersion5);
				expect(result.meta).toMap(metaSchema);
			}
		});

		it('Returns list of voters when requested for existing account by publickey', async () => {
			if (refDelegate.summary.publicKey) {
				const response = await getVoters({ publicKey: refDelegate.summary.publicKey });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toMap(voterSchemaVersion5);
				expect(result.meta).toMap(metaSchema);
			}
		});

		it('Returns list of voters when requested with offset', async () => {
			const response = await getVoters({ address: refDelegate.summary.address, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(voterSchemaVersion5);
			expect(result.meta).toMap(metaSchema);
		});

		it('Returns list of voters when requested with limit', async () => {
			const response = await getVoters({ address: refDelegate.summary.address, limit: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(voterSchemaVersion5);
			expect(result.meta).toMap(metaSchema);
		});

		it('Returns list of voters when requested with offset & limit', async () => {
			const response = await getVoters({
				address: refDelegate.summary.address, offset: 1, limit: 1,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(voterSchemaVersion5);
			expect(result.meta).toMap(metaSchema);
		});

		it('Returns INVALID_PARAMS (-32602) when requested with limit = 0', async () => {
			const response = await getVoters({ address: refDelegate.summary.address, limit: 0 });
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

		it('Returns INVALID_REQUEST (-32600) when requested without required params', async () => {
			const response = await getVoters({});
			expect(response).toMap(invalidRequestSchema);
		});
	});
});
