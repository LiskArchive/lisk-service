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
	invalidBlock,
} = require('../constants/blocks');

const {
	decodedTransaction,
	invalidTransaction,
	encodedTransaction,
} = require('../constants/transactions');

const config = require('../../config');

const broker = new ServiceBroker({
	transporter: config.transporter,
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});

describe('Functional tests for encoder', () => {
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	it('encode transaction', async () => {
		const result = await broker.call('connector.encodeTransaction', { transaction: decodedTransaction });
		expect(typeof result).toBe('string');
		expect(result).toEqual(encodedTransaction);
	});

	it('throws error when encoding invalid transaction', async () => {
		expect(broker.call('connector.encodeTransaction', { transaction: invalidTransaction })).rejects.toThrow();
	});

	it('throws error when encoding invalid block', async () => {
		expect(broker.call('connector.encodeTransaction', { block: invalidBlock })).rejects.toThrow();
	});
});
