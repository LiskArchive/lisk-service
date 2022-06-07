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
	voteSchemaVersion5,
} = require('../../../schemas/api_v2/vote.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;

[
	'get.votes_sent',
].forEach(methodName => {
	const getVotes = async params => request(wsRpcUrl, methodName, params);

	describe(`Method ${methodName}`, () => {
		let refDelegate;
		beforeAll(async () => {
			let response;
			do {
				// eslint-disable-next-line no-await-in-loop
				response = await request(wsRpcUrl, 'get.accounts', { isDelegate: true, limit: 1 });
			} while (!response.result);
			[refDelegate] = response.result.data;
		});

		it('Returns list of votes when requested for existing account by account ID', async () => {
			const response = await getVotes({ address: refDelegate.summary.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(voteSchemaVersion5);
			expect(result.meta).toMap(metaSchema);
		});

		it('Returns list of votes when requested for existing account by username', async () => {
			if (refDelegate.summary.username) {
				const response = await getVotes({ username: refDelegate.summary.username });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toMap(voteSchemaVersion5);
				expect(result.meta).toMap(metaSchema);
			}
		});

		it('Returns list of votes when requested for existing account by publickey', async () => {
			if (refDelegate.summary.publicKey) {
				const response = await getVotes({ publicKey: refDelegate.summary.publicKey });
				expect(response).toMap(jsonRpcEnvelopeSchema);
				const { result } = response;
				expect(result.data).toMap(voteSchemaVersion5);
				expect(result.meta).toMap(metaSchema);
			}
		});

		it('Returns empty response when requested with wrong address', async () => {
			const response = await getVotes({ address: '999999999L' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('Returns INVALID_PARAMS (-32602) when requested with unsupported param', async () => {
			const response = await getVotes({ unsupported_param: 0 });
			expect(response).toMap(invalidParamsSchema);
		});

		it('Returns INVALID_REQUEST (-32600) when requested without required params', async () => {
			const response = await getVotes({});
			expect(response).toMap(invalidRequestSchema);
		});
	});
});
