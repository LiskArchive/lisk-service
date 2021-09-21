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
const config = require('../../../../config');
const { api } = require('../../../../helpers/api');

const {
	transactionsByTimestampAsc,
	transactionsById,
	transactionsByBlockId,
	transactionByModuleAssetId,
	transactionsBySenderAddress,
	transactionsByRecipientAddress,
} = require('../expectedResponse/http/transactions');

const {
	transactionsSchema,
} = require('../expectedResponse/http/transactionsSchema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/transactions`;

describe('Transactions API', () => {
	it('Retrieve transactions by ascending timestamp', async () => {
		const response = await api.get(`${endpoint}?sort=timestamp:asc`);

		// response.data
		expect(response.data).toStrictEqual(transactionsByTimestampAsc.data);

		// response.meta
		expect(response.meta.count).toStrictEqual(transactionsByTimestampAsc.meta.count);
		expect(response.meta.offset).toStrictEqual(transactionsByTimestampAsc.meta.offset);
		expect(response.meta.total).toBeGreaterThanOrEqual(transactionsByTimestampAsc.meta.total);
	});

	it('Retrieve transaction by transactionId', async () => {
		const response = await api.get(`${endpoint}?transactionId=${transactionsById.data[0].id}`);
		expect(response).toStrictEqual(transactionsById);
	});

	it('Retrieve transactions by blockId', async () => {
		const blockId = transactionsByBlockId.data[0].block.id;
		const response = await api.get(`${endpoint}?blockId=${blockId}`);
		expect(response).toStrictEqual(transactionsByBlockId);
	});

	it('Retrieve transactions by moduleAssetId', async () => {
		const { moduleAssetId } = transactionByModuleAssetId.data[0];
		const response = await api.get(`${endpoint}?sort=timestamp:asc&moduleAssetId=${moduleAssetId}`);

		// response.data
		expect(response.data).toStrictEqual(transactionByModuleAssetId.data);

		// response.meta
		expect(response.meta.count).toStrictEqual(transactionByModuleAssetId.meta.count);
		expect(response.meta.offset).toStrictEqual(transactionByModuleAssetId.meta.offset);
		expect(response.meta.total).toBeGreaterThanOrEqual(transactionByModuleAssetId.meta.total);
	});

	it('Retrieve transactions by senderAddress', async () => {
		const senderAddress = transactionsBySenderAddress.data[0].sender.address;
		const response = await api.get(`${endpoint}?sort=timestamp:asc&senderAddress=${senderAddress}`);

		// response.data
		expect(response.data).toStrictEqual(transactionsBySenderAddress.data);

		// response.meta
		expect(response.meta.count).toStrictEqual(transactionsBySenderAddress.meta.count);
		expect(response.meta.offset).toStrictEqual(transactionsBySenderAddress.meta.offset);
		expect(response.meta.total).toBeGreaterThanOrEqual(transactionsBySenderAddress.meta.total);
	});

	it('Retrieve transactions by recipientAddress', async () => {
		const recipientAddress = transactionsByRecipientAddress.data[0].asset.recipient.address;
		const response = await api.get(`${endpoint}?sort=timestamp:asc&recipientAddress=${recipientAddress}`);

		// response.data
		expect(response.data).toStrictEqual(transactionsByRecipientAddress.data);

		// response.meta
		expect(response.meta.count).toStrictEqual(transactionsByRecipientAddress.meta.count);
		expect(response.meta.offset).toStrictEqual(transactionsByRecipientAddress.meta.offset);
		expect(response.meta.total).toBeGreaterThanOrEqual(transactionsByRecipientAddress.meta.total);
	});

	it('Retrieve transactions schema', async () => {
		const response = await api.get(`${endpoint}/schemas`);
		expect(response).toStrictEqual(transactionsSchema);
	});
});
