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
const { api } = require('../../../helpers/api');

const { badRequestSchema } = require('../../../schemas/httpGenerics.schema');

const {
	goodRequestSchema,
	legacyAccountsSchema,
	legacyAccountsMetaSchema,
} = require('../../../schemas/api_v3/legacyAccountsSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/legacy`;

describe('Legacy accounts API', () => {
	it('should return legacy account info', async () => {
		const publicKey = '1ec4a852f5cd5a86877243aca6f3585e5582fd22e8dc8b9d9232241b182c6bcc';
		const response = await api.get(`${endpoint}?publicKey=${publicKey}`);
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(legacyAccountsSchema);
		expect(response.meta).toMap(legacyAccountsMetaSchema);
	});

	it('should return bad request if requested with public key less than 64 chars', async () => {
		const response = await api.get(
			`${endpoint}?publicKey=1ec4a852f5cd5a86877243aca6f3585e5582fd22e8dc8b9d9232241b182c6bc`,
			400,
		);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request if requested with public key more than 64 chars', async () => {
		const response = await api.get(
			`${endpoint}?publicKey=1ec4a852f5cd5a86877243aca6f3585e5582fd22e8dc8b9d9232241b182c6bcca`,
			400,
		);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request if requested with invalid public key of 64 characters', async () => {
		const response = await api.get(
			`${endpoint}?publicKey=!@#$%^&*()!@#$%^&*()!@#$%^&*()!@#$%^&*()!@#$%^&*()!@#$%^&*()!@#$`,
			400,
		);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request if requested with invalid public key containing sql wildcard characters', async () => {
		const response = await api.get(`${endpoint}?publicKey=___%`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request if requested with invalid param', async () => {
		const response = await api.get(`${endpoint}?invalidParam=invalid`, 400);
		expect(response).toMap(badRequestSchema);
	});

	it('should return bad request if requested with no params', async () => {
		const response = await api.get(endpoint, 400);
		expect(response).toMap(badRequestSchema);
	});
});
