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
	blockWithTransaction,
	decodedBlockWithTransaction,
	blockWithoutTransaction,
	decodedBlockWithoutTransaction,
	invalidEncodedBlock,
	invalidEncodedTransaction,
} = require('../constants/blocks');

const {
	transaction,
	decodedTransaction,
} = require('../constants/transactions');

const {
	decodedTransferEvent,
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

	it('format Transaction', async () => {
		const result = await broker.call('connector.formatTransaction', { transaction });
		expect(Object.keys(result)).toEqual(Object.keys(decodedTransaction));
		expect(result).toMatchObject(decodedTransaction);
	});

	it('format block with transaction', async () => {
		const result = await broker.call('connector.formatBlock', { block: blockWithTransaction });
		expect(result).toMatchObject({
			header: expect.any(Object),
			assets: expect.any(Object),
			transactions: expect.any(Object),
		});

		expect(result.transactions.length).toBe(1);
		expect(Object.keys(result.header)).toEqual(Object.keys(decodedBlockWithTransaction.header));
		expect(Object.keys(result.assets[0]))
			.toEqual(Object.keys(decodedBlockWithTransaction.assets[0]));
		expect(Object.keys(result.transactions[0]))
			.toEqual(Object.keys(decodedBlockWithTransaction.transactions[0]));
		expect(result).toMatchObject(decodedBlockWithTransaction);
	});

	it('format block without transactions', async () => {
		const result = await broker.call('connector.formatBlock', { block: blockWithoutTransaction });
		expect(result).toMatchObject({
			header: expect.any(Object),
			assets: expect.any(Object),
			transactions: expect.any(Object),
		});
		expect(Object.keys(result.header)).toEqual(Object.keys(decodedBlockWithoutTransaction.header));
		expect(Object.keys(result.assets[0]))
			.toEqual(Object.keys(decodedBlockWithoutTransaction.assets[0]));
		expect(result.transactions.length).toBe(0);
		expect(result).toMatchObject(decodedBlockWithoutTransaction);
	});

	it('format subscription event payload', async () => {
		const result = await broker.call('connector.formatAPIClientEventPayload', {
			eventName: 'app_newBlock',
			payload: { block: blockWithTransaction },
		});
		expect(result).toMatchObject(decodedBlockWithTransaction);
	});

	it('format event payload for token:transferEvent', async () => {
		const result = await broker.call('connector.formatEvent', {
			event: transferEventInput,
		});
		expect(result).toMatchObject(decodedTransferEvent);
	});

	it('format response', async () => {
		const result = await broker.call('connector.formatResponse', {
			endpoint: 'app_getBlockByHeight',
			response: blockWithTransaction,
		});
		expect(result).toMatchObject(decodedBlockWithTransaction);
	});

	it('throws error when decoding invalid encoded transaction', async () => {
		expect(broker.call('connector.formatTransaction', { encodedTransaction: invalidEncodedTransaction })).rejects.toThrow();
	});

	it('throws error when decoding invalid encoded block', async () => {
		expect(broker.call('connector.formatBlock', { block: invalidEncodedBlock })).rejects.toThrow();
	});
});
