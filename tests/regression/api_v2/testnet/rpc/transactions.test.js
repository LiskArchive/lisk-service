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
const { request } = require('../../../../helpers/socketIoRpcRequest');

const {
	transactionsByTimestampAsc,
	transactionsById,
	transactionsByBlockId,
	transactionByModuleAssetId,
	transactionsBySenderAddress,
	transactionsByRecipientAddress,
} = require('../expectedResponse/rpc/transactions');

const {
	transactionsSchema,
} = require('../expectedResponse/rpc/transactionsSchema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getTransactions = async params => request(wsRpcUrl, 'get.transactions', params);
const getTransactionsSchemas = async () => request(wsRpcUrl, 'get.transactions.schemas');

describe('Transactions API', () => {
	it('Retrieve transactions by ascending timestamp', async () => {
		const response = await getTransactions({ sort: 'timestamp:asc' });

		// response.result.data
		expect(response.result.data).toStrictEqual(transactionsByTimestampAsc.result.data);

		// response.result.meta
		expect(response.result.meta.count)
			.toStrictEqual(transactionsByTimestampAsc.result.meta.count);
		expect(response.result.meta.offset)
			.toStrictEqual(transactionsByTimestampAsc.result.meta.offset);
		expect(response.result.meta.total)
			.toBeGreaterThanOrEqual(transactionsByTimestampAsc.result.meta.total);
	});

	it('Retrieve transaction by transactionId', async () => {
		const response = await getTransactions({ transactionId: transactionsById.result.data[0].id });
		expect(response).toStrictEqual(transactionsById);
	});

	it('Retrieve transactions by blockId', async () => {
		const blockId = transactionsByBlockId.result.data[0].block.id;
		const response = await getTransactions({ blockId });
		expect(response).toStrictEqual(transactionsByBlockId);
	});

	it('Retrieve transactions by moduleAssetId', async () => {
		const { moduleAssetId } = transactionByModuleAssetId.result.data[0];
		const response = await getTransactions({ sort: 'timestamp:asc', moduleAssetId });

		// response.result.data
		expect(response.result.data).toStrictEqual(transactionByModuleAssetId.result.data);

		// response.result.meta
		expect(response.result.meta.count)
			.toStrictEqual(transactionByModuleAssetId.result.meta.count);
		expect(response.result.meta.offset)
			.toStrictEqual(transactionByModuleAssetId.result.meta.offset);
		expect(response.result.meta.total)
			.toBeGreaterThanOrEqual(transactionByModuleAssetId.result.meta.total);
	});

	it('Retrieve transactions by senderAddress', async () => {
		const senderAddress = transactionsBySenderAddress.result.data[0].sender.address;
		const response = await getTransactions({ sort: 'timestamp:asc', senderAddress });

		// response.result.data
		expect(response.result.data).toStrictEqual(transactionsBySenderAddress.result.data);

		// response.result.meta
		expect(response.result.meta.count)
			.toStrictEqual(transactionsBySenderAddress.result.meta.count);
		expect(response.result.meta.offset)
			.toStrictEqual(transactionsBySenderAddress.result.meta.offset);
		expect(response.result.meta.total)
			.toBeGreaterThanOrEqual(transactionsBySenderAddress.result.meta.total);
	});

	it('Retrieve transactions by recipientAddress', async () => {
		const recipientAddress = transactionsByRecipientAddress.result.data[0].asset.recipient.address;
		const response = await getTransactions({ sort: 'timestamp:asc', recipientAddress });

		// response.result.data
		expect(response.result.data).toStrictEqual(transactionsByRecipientAddress.result.data);

		// response.result.meta
		expect(response.result.meta.count)
			.toStrictEqual(transactionsByRecipientAddress.result.meta.count);
		expect(response.result.meta.offset)
			.toStrictEqual(transactionsByRecipientAddress.result.meta.offset);
		expect(response.result.meta.total)
			.toBeGreaterThanOrEqual(transactionsByRecipientAddress.result.meta.total);
	});

	it('Retrieve transactions schema', async () => {
		const response = await getTransactionsSchemas();
		expect(response).toStrictEqual(transactionsSchema);
	});
});
