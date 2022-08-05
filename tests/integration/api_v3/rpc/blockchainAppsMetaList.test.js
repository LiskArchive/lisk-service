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
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	blockchainAppMetaListSchema,
} = require('../../../schemas/api_v3/blockchainAppsMetaListSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getBlockchainApps = async (params) => request(wsRpcUrl, 'get.blockchain.apps.meta.list', params);

// TODO: Enable test cases once off-chain data is available
xdescribe('get.blockchain.apps.meta.list', () => {
	it('returns list', async () => {
		const response = await getBlockchainApps();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('returns list with limit=10', async () => {
		const response = await getBlockchainApps({ limit: 10 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('returns list with limit=10 and offset=1', async () => {
		const response = await getBlockchainApps({ limit: 10, offset: 1 });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('returns list with limit=10, offset=1 and sort=name:desc', async () => {
		const response = await getBlockchainApps({ limit: 10, offset: 1, sort: 'name:desc' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toBeGreaterThanOrEqual(1);
		expect(result.data.length).toBeLessThanOrEqual(10);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain applications meta list by name', async () => {
		const response = await getBlockchainApps({ name: 'Lisk' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('returns blockchain applications meta list by partial search', async () => {
		const response = await getBlockchainApps({ search: 'Lisk' });
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result.data).toBeInstanceOf(Array);
		expect(result.data.length).toEqual(1);
		result.data.forEach(blockchainApp => expect(blockchainApp).toMap(blockchainAppMetaListSchema));
		expect(result.meta).toMap(metaSchema);
	});

	it('invalid request param -> invalid param', async () => {
		const response = await getBlockchainApps({ invalidParam: 'invalid' });
		expect(response).toMap(invalidParamsSchema);
	});
});
