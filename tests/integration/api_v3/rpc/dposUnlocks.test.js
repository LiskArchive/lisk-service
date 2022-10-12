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
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	unlockSchema,
} = require('../../../schemas/api_v3/unlock.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;

const getUnlocks = async (params) => request(wsRpcUrl, 'get.dpos.unlocks', params);
const getTransactions = async (params) => request(wsRpcUrl, 'get.transactions', params);

describe('get.dpos.unlocks', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await getTransactions({ moduleCommandID: '13:1', limit: 1 });
		[refTransaction] = response.result.data;
	});

	it('Returns unlocks when requested for existing account by address', async () => {
		const response = await getUnlocks({ address: refTransaction.sender.address });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(unlockSchema);
		expect(result.data.unlocking.length).toBeGreaterThanOrEqual(1);
		expect(result.data.unlocking.length).toBeLessThanOrEqual(10);
		expect(result.meta).toMap(metaSchema);
	});

	it('Returns unlocks when requested for existing account by name', async () => {
		if (refTransaction.sender.name) {
			const response = await getUnlocks({ name: refTransaction.sender.name });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(unlockSchema);
			expect(result.data.unlocking.length).toBeGreaterThanOrEqual(1);
			expect(result.data.unlocking.length).toBeLessThanOrEqual(10);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('Returns unlocks when requested for existing account by publicKey', async () => {
		if (refTransaction.sender.publicKey) {
			const response = await getUnlocks({ publicKey: refTransaction.sender.publicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(unlockSchema);
			expect(result.data.unlocking.length).toBeGreaterThanOrEqual(1);
			expect(result.data.unlocking.length).toBeLessThanOrEqual(10);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('Returns unlocks when requested for existing account by address and limit=5', async () => {
		const response = await getUnlocks({
			address: refTransaction.sender.address,
			limit: 5,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(unlockSchema);
		expect(result.data.unlocking.length).toBeGreaterThanOrEqual(1);
		expect(result.data.unlocking.length).toBeLessThanOrEqual(5);
		expect(result.meta).toMap(metaSchema);
	});

	it('Returns unlocks when requested for existing account by address, limit=5 and offset=1', async () => {
		const response = await getUnlocks({
			address: refTransaction.sender.address,
			limit: 5,
			offset: 1,
		});
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toMap(unlockSchema);
		expect(result.data.unlocking.length).toBeGreaterThanOrEqual(1);
		expect(result.data.unlocking.length).toBeLessThanOrEqual(5);
		expect(result.meta).toMap(metaSchema);
	});

	it('Returns unlocks when requested for existing account by address, name and limit=5', async () => {
		if (refTransaction.sender.name) {
			const response = await getUnlocks({
				address: refTransaction.sender.address,
				name: refTransaction.sender.name,
				limit: 5,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(unlockSchema);
			expect(result.data.unlocking.length).toBeGreaterThanOrEqual(1);
			expect(result.data.unlocking.length).toBeLessThanOrEqual(5);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('Returns unlocks when requested for existing account by address, publicKey and limit=5', async () => {
		if (refTransaction.sender.publicKey) {
			const response = await getUnlocks({
				address: refTransaction.sender.address,
				publicKey: refTransaction.sender.publicKey,
				limit: 5,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toMap(unlockSchema);
			expect(result.data.unlocking.length).toBeGreaterThanOrEqual(1);
			expect(result.data.unlocking.length).toBeLessThanOrEqual(5);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('No Params -> invalid param', async () => {
		const response = await getUnlocks({});
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getUnlocks({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid address -> invalid param', async () => {
		const response = await getUnlocks({ address: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
		expect(response).toMap(invalidParamsSchema);
	});

	it('invalid publicKey -> invalid param', async () => {
		const response = await getUnlocks({ publicKey: 'invalid_pk' });
		expect(response).toMap(invalidParamsSchema);
	});
});
