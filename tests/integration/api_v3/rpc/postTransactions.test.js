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
const config = require('../../../config');

const {
	request,
} = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	postTransactionSchema,
} = require('../../../schemas/api_v3/transaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const postTransaction = async params => request(wsRpcUrl, 'post.transactions', params);

describe('Method post.transactions', () => {
	it('Post transaction succesfully', async () => {
		const response = await postTransaction(
			{
				transaction: '0a05746f6b656e12087472616e7366657218032080c2d72f2a20a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f032270a0800000000000000001080c2d72f1a1474e3ba5ade3e94451bd4de9d19917c8e6eff624d22003a406049978f45e5664507a7a2a6a2fd0b76f98144fec26d54a0b73eac05c94cf23d4c794c25a82738c415640b28cddeeda1e9ea0d0a6e2268ab32666da2a49b3d06',
			},
		);
		const { result } = response;

		expect(result).toBeInstanceOf(Object);
		expect(result).toMap(postTransactionSchema);
	});

	it.only('invalid binary transaction -> empty response', async () => {
		const response = await postTransaction({ transaction: 'a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32250880c2d72f1214b49074a2eb04e7611908985f02c12fb7cd488d451a0874657374207478733a4065faed7b49d1ee63730cbb545ea25e5036' }).catch(e => e);
		expect(response).toMap(emptyResponseSchema);
		const { result } = response;
		expect(result).toMap(emptyResultEnvelopeSchema);
	});

	it('invalid query parameter -> -32602', async () => {
		const response = await postTransaction({ transactions: '0802100018002080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32250880c2d72f1214b49074a2eb04e7611908985f02c12fb7cd488d451a0874657374207478733a4065faed7b49d1ee63730cbb545ea25e50361581e35412eeffac3b35746afd1176d2ee1e270e8b072b1ccfad2d64f72918063c383003971600d56b168d6e429f05' }).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});
