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
const { ServiceBroker } = require('moleculer');

const {
	block,
	blockWithTransaction,
	encodedBlock,
	invalidEncodedBlock,
	invalidEncodedTransaction,
	encodedBlockWithTransaction,
} = require('../constants/blocks');

const {
	transaction,
	encodedTransaction,
} = require('../constants/transactions');

const {
	decodedTransferEventData,
	transferEventSchema,
	transferEventInput,
} = require('../constants/events');

const config = require('../../config');

const broker = new ServiceBroker({
	transporter: config.transporter,
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});

describe('Functional tests for decoder', () => {
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	it('decode Transaction', async () => {
		const result = await broker.call('connector.decodeTransactionSerialized', { encodedTransaction });
		expect(Object.keys(result)).toEqual(Object.keys(transaction));
		expect(result).toMatchObject(transaction);
	});

	it('decode block with transaction', async () => {
		const result = await broker.call('connector.decodeBlockSerialized', { encodedBlock: encodedBlockWithTransaction });
		expect(result).toMatchObject({
			header: expect.any(Object),
			assets: expect.any(Object),
			transactions: expect.any(Object),
		});

		expect(result.transactions.length).toBe(1);
		expect(Object.keys(result.header)).toEqual(Object.keys(block.header));
		expect(Object.keys(result.assets[0])).toEqual(Object.keys(block.assets[0]));
		expect(Object.keys(result.transactions[0]))
			.toEqual(Object.keys(blockWithTransaction.transactions[0]));
		expect(result).toMatchObject(blockWithTransaction);
	});

	it('decode block without transactions', async () => {
		const result = await broker.call('connector.decodeBlockSerialized', { encodedBlock });
		expect(result).toMatchObject({
			header: expect.any(Object),
			assets: expect.any(Object),
			transactions: expect.any(Object),
		});
		expect(Object.keys(result.header)).toEqual(Object.keys(block.header));
		expect(Object.keys(result.assets[0])).toEqual(Object.keys(block.assets[0]));
		expect(result.transactions.length).toBe(0);
		expect(result).toMatchObject(block);
	});

	it('decode subscription event payload', async () => {
		const result = await broker.call('connector.decodeSubscriptionEventPayload', {
			eventName: 'app_newBlock',
			payload: { block: encodedBlock },
		});
		expect(result).toMatchObject(block);
	});

	it('decode event payload for token:transferEvent', async () => {
		const result = await broker.call('connector.decodeEventPayload', {
			encodedEvent: transferEventInput.data,
			schema: transferEventSchema,
		});
		expect(result).toMatchObject(decodedTransferEventData);
	});

	it('decode response', async () => {
		const result = await broker.call('connector.decodeResponse', {
			endpoint: 'app_getBlockByHeight',
			response: encodedBlock,
		});
		expect(result).toMatchObject(block);
	});

	it('throws error when decoding invalid encoded transaction', async () => {
		expect(broker.call('connector.decodeTransactionSerialized', { encodedTransaction: invalidEncodedTransaction })).rejects.toThrow();
	});

	it('throws error when decoding invalid encoded block', async () => {
		expect(broker.call('connector.decodeBlockSerialized', { encodedBlock: invalidEncodedBlock })).rejects.toThrow();
	});
});
