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
import api from '../../helpers/api';
import delegates from './constants/delegates';
import accounts from './constants/accounts';
import config from '../../config';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/delegates`;
const delegateEndpoint = `${baseUrlV1}/delegate`;

const delegateSchema = {
	address: 'string',
	approval: 'string',
	missedBlocks: 'number',
	producedBlocks: 'number',
	productivity: 'string',
	publicKey: 'string',
	rank: 'number',
	rewards: 'number',
	username: 'string',
	vote: 'string',
};

const badRequestSchema = {
	errors: 'array',
	message: 'string',
};

const notFoundErrorSchema = {
	error: 'boolean',
	message: 'string',
};

const wrongInputParamSchema = {
	error: 'boolean',
	message: 'string',
};

const swaggerWrongInput = {
	errors: 'array',
	message: 'string',
};

xdescribe('Delegates API', () => {
	describe('GET /delegates', () => {
		it('known delegate by address -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${delegates.activeDelegate.address}`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				address: delegates.activeDelegate.address,
			});
		});

		it('known delegate by public key -> ok', async () => {
			const response = await api.get(`${endpoint}?publickey=${delegates.activeDelegate.publicKey}`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				publicKey: delegates.activeDelegate.publicKey,
			});
		});

		// FIXME: This test is disabled due to lack of the right account in the test blockchain
		// Type 1+2 reqiured to make this test passing
		xit('known address by second public key', async () => {
			const url = `${endpoint}?secpubkey=${accounts['second passphrase account'].secondPublicKey}`;
			const expectedStatus = 200;
			const response = await api.get(url, expectedStatus);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				secondPublicKey: accounts['second passphrase account'].secondPublicKey,
			});
		});

		it('known delegate by username -> ok', async () => {
			const response = await api.get(`${endpoint}?username=${delegates.activeDelegate.username}`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				username: delegates.activeDelegate.username,
			});
		});

		it('invalid address -> 400', () => expect(api.get(`${endpoint}?address=412875216073141752800000`, 400)).resolves.toMapRequiredSchema({
			...swaggerWrongInput,
		}));

		it('wrong input param -> 400', () => expect(api.get(`${endpoint}?id=412875216073141752800000`, 400)).resolves.toMapRequiredSchema({
			...wrongInputParamSchema,
		}));

		it('search delegates -> ok', async () => {
			const response = await api.get(`${endpoint}?search=genesis`);
			expect(response.data.length).toEqual(10);
		});

		it('wrong delegate publickey -> 404', () => expect(api.get(`${endpoint}?publickey=412875216073141752800000`, 404)).resolves.toMapRequiredSchema({
			...notFoundErrorSchema,
		}));

		it('known delegate username -> ok', async () => {
			const response = await api.get(`${endpoint}?username=cc001`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				username: delegates.activeDelegate.username,
			});
		});

		it('wrong username -> 404', () => expect(api.get(`${endpoint}?username=genesis_510000000`, 404)).resolves.toMapRequiredSchema({
			...notFoundErrorSchema,
		}));
	});

	describe('GET /delegates/active', () => {
		it('default -> ok', async () => {
			const response = await api.get(`${endpoint}/active`);
			expect(response.data).toBeArrayOfSize(101);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				address: delegates.activeDelegate.address,
			});

			expect(response.data[0]).toEqual(
				expect.objectContaining({
					address: '5201600508578320196L',
					missedBlocks: 194,
					productivity: '99.85',
					publicKey:
						'473c354cdf627b82e9113e02a337486dd3afc5615eb71ffd311c5a0beda37b8c',
					secondPublicKey:
						'02bb04b8b15f10edcd5fbc067c6107841b527a39d57dd33156de616714863bae',
					rank: 1,
					username: 'cc001',
				}),
			);
		});

		it('limit = 0 -> 400', async () => {
			expect(api.get(`${endpoint}/active?limit=0`, 400)).resolves.toMapRequiredSchema(badRequestSchema);
		});

		it('empty limit -> 400', async () => {
			expect(api.get(`${endpoint}/active?limit=`, 400)).resolves.toMapRequiredSchema(badRequestSchema);
		});
	});

	describe('GET /delegates/standby', () => {
		it('default -> ok', async () => {
			const response = await api.get(`${endpoint}/standby`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				address: delegates.standbyDelegate.address,
			});
		});

		it('limit = 100 -> ok', async () => {
			const response = await api.get(`${endpoint}/standby?limit=100`);
			expect(response.data).toBeArrayOfSize(100);
			expect(response.data[0]).toMapRequiredSchema(delegateSchema);
		});

		it('limit = 0 -> 400', async () => {
			expect(api.get(`${endpoint}/standby?limit=0`, 400)).resolves.toMapRequiredSchema(badRequestSchema);
		});

		it('empty limit -> 400', async () => {
			expect(api.get(`${endpoint}/standby?limit=`, 400)).resolves.toMapRequiredSchema(badRequestSchema);
		});
	});

	describe('GET /delegates/latest_registrations', () => {
		it('limit = 100 -> ok', async () => {
			const response = await api.get(`${endpoint}/latest_registrations?limit=100`);
			expect(response.data).toBeArrayOfSize(100);
			expect(response.data[0]).toMapRequiredSchema(delegateSchema);
		});

		it('limit = 0 -> 400', async () => {
			expect(api.get(`${endpoint}/latest_registrations?limit=0`, 400)).resolves.toMapRequiredSchema(badRequestSchema);
		});

		it('empty limit -> 400', async () => {
			expect(api.get(`${endpoint}/latest_registrations?limit=`, 400)).resolves.toMapRequiredSchema(badRequestSchema);
		});
	});

	describe('GET /delegates/next_forgers', () => {
		it('limit = 100 -> ok', async () => {
			const response = await api.get(`${endpoint}/next_forgers?limit=100`);
			expect(response.data).toBeArrayOfSize(100);
			expect(response.data[0]).toMapRequiredSchema(delegateSchema);
		});

		it('limit = 0 -> 400', async () => {
			expect(api.get(`${endpoint}/next_forgers?limit=0`, 400)).resolves.toMapRequiredSchema(badRequestSchema);
		});

		it('empty limit -> 400', async () => {
			expect(api.get(`${endpoint}/next_forgers?limit=`, 400)).resolves.toMapRequiredSchema(badRequestSchema);
		});
	});

	describe('GET /delegate/{address}', () => {
		it('known address -> ok', async () => {
			const response = await api.get(`${delegateEndpoint}/${delegates.activeDelegate.address}`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				address: delegates.activeDelegate.address,
			});
		});

		it('known username -> ok', async () => {
			const response = await api.get(`${delegateEndpoint}/${delegates.activeDelegate.username}`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				username: delegates.activeDelegate.username,
			});
		});

		it('known public key -> ok', async () => {
			const response = await api.get(`${delegateEndpoint}/${delegates.activeDelegate.publicKey}`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				publicKey: delegates.activeDelegate.publicKey,
			});
		});

		it('known address with address: -> ok', async () => {
			const response = await api.get(`${delegateEndpoint}/address:${delegates.activeDelegate.address}`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				address: delegates.activeDelegate.address,
			});
		});

		it('known username with username: -> ok', async () => {
			const response = await api.get(`${delegateEndpoint}/username:${delegates.activeDelegate.username}`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				username: delegates.activeDelegate.username,
			});
		});

		it('known public key with publickey: -> ok', async () => {
			const response = await api.get(`${delegateEndpoint}/publickey:${delegates.activeDelegate.publicKey}`);
			expect(response.data[0]).toMapRequiredSchema({
				...delegateSchema,
				publicKey: delegates.activeDelegate.publicKey,
			});
		});

		it('wrong address -> 404', () => expect(api.get(`${delegateEndpoint}/genesis_510000000`, 404)).resolves.toMapRequiredSchema({
			...notFoundErrorSchema,
		}));
	});
});
