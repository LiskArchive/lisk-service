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
	encodedBlock,
	encodedBlockWithTransaction,
} = require('../constants/blocks');

const {
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
		expect(result).toMatchObject({
			header: expect.any(Object),
			assets: expect.any(Object),
			transactions: expect.any(Object),
		});
	});

	xit('decodse block with transaction', async () => {
		const result = await broker.call('connector.decodeBlock', { encodedBlock: encodedBlockWithTransaction });
		expect(result).toMatchObject({
			header: expect.any(Object),
			assets: expect.any(Object),
			transactions: expect.any(Object),
		});
	});

	it('decode block without transactions', async () => {
		const result = await broker.call('connector.decodeBlock', { encodedBlock });
		expect(result).toMatchObject({
			header: expect.any(Object),
			assets: expect.any(Object),
			transactions: expect.any(Object),
		});
	});
});
