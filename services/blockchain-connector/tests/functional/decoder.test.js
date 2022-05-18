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
	encodedBlock,
	invalidEncodedBlock,
	invalidEncodedTransaction,
	encodedBlockWithTransaction,
} = require('../constants/blocks');

const {
	transaction,
	encodedTransaction,
} = require('../constants/transactions');

const broker = new ServiceBroker({
	transporter: 'redis://localhost:6379/0',
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});

describe('Functional tests for decoder', () => {
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	xit('decode Transaction', async () => {
		const result = await broker.call('connector.decodeTransaction', { encodedTransaction });
		expect(Object.keys(result)).toEqual(Object.keys(transaction));
	});

	xit('decode block with transaction', async () => {
		const result = await broker.call('connector.decodeBlock', { encodedBlock: encodedBlockWithTransaction });
		expect(result).toMatchObject({
			header: expect.any(Object),
			assets: expect.any(Object),
			transactions: expect.any(Object),
		});
		expect(result.transaction.length).toBe(1);
		expect(Object.keys(result.header)).toEqual(Object.keys(block.header));
		expect(Object.keys(result.assets[0])).toEqual(Object.keys(block.assets[0]));
		expect(Object.keys(result.transactions[0])).toEqual(Object.keys(block.transactions[0]));
	});

	it('decode block without transactions', async () => {
		const result = await broker.call('connector.decodeBlock', { encodedBlock });
		expect(result).toMatchObject({
			header: expect.any(Object),
			assets: expect.any(Object),
			transactions: expect.any(Object),
		});
		expect(Object.keys(result.header)).toEqual(Object.keys(block.header));
		expect(Object.keys(result.assets[0])).toEqual(Object.keys(block.assets[0]));
		expect(result.transactions.length).toBe(0);
	});

	it('decode event payload', async () => {
		const result = await broker.call('connector.decodeEventPayload',
			{
				eventName: 'app_newBlock',
				payload: {
					block: encodedBlock,
				}
			}
		);
		expect(result).toMatchObject(block);
	});

	it('decode response', async () => {
		const result = await broker.call('connector.decodeResponse',
			{
				action: 'app_getBlockByHeight',
				response: encodedBlock,
			}
		);
		expect(result).toMatchObject(block);
	});

	it('throws error when decoding invalid encoded transaction', async () => {
		expect(broker.call('connector.decodeTransaction', { encodedTransaction: invalidEncodedTransaction })).rejects.toThrow();
	});

	it('throws error when decoding invalid encoded block', async () => {
		expect(broker.call('connector.decodeBlock', { encodedBlock: invalidEncodedBlock })).rejects.toThrow();
	});
});
