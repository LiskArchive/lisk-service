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

const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	invalidParamsSchema,
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	legacyAccountsSchema,
	legacyAccountsMetaSchema,
} = require('../../../schemas/api_v3/legacyAccountsSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getLegacyAccountInfo = async params => request(wsRpcUrl, 'get.legacy', params);

describe('get.legacy', () => {
	it('should return legacy account info', async () => {
		const response = await getLegacyAccountInfo({
			publicKey: '1ec4a852f5cd5a86877243aca6f3585e5582fd22e8dc8b9d9232241b182c6bcc',
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(legacyAccountsSchema);
		expect(result.meta).toMap(legacyAccountsMetaSchema);
	});

	it('should return bad request if requested with public key less than 64 chars', async () => {
		const response = await getLegacyAccountInfo({
			publicKey: '1ec4a852f5cd5a86877243aca6f3585e5582fd22e8dc8b9d9232241b182c6bc',
		});
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return bad request if requested with public key more than 64 chars', async () => {
		const response = await getLegacyAccountInfo({
			publicKey: '1ec4a852f5cd5a86877243aca6f3585e5582fd22e8dc8b9d9232241b182c6bcca',
		});
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return bad request if requested with invalid public key of 64 characters', async () => {
		const response = await getLegacyAccountInfo({
			publicKey: '!@#$%^&*()!@#$%^&*()!@#$%^&*()!@#$%^&*()!@#$%^&*()!@#$%^&*()!@#$',
		});
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return bad request if requested with invalid public key containing sql wildcard characters', async () => {
		const response = await getLegacyAccountInfo({ publicKey: '___%' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return bad request if requested with invalid param', async () => {
		const response = await getLegacyAccountInfo({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('should return bad request if requested with no params', async () => {
		const response = await getLegacyAccountInfo();
		expect(response).toMap(invalidParamsSchema);
	});
});
