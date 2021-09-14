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
const { ServiceBroker } = require('moleculer');
const { transactionSchema } = require('../schemas/api_v2/transactionSchema.schema');
const { serviceUnavailableSchema } = require('../schemas/api_v2/serviceUnavailable.schema');

const broker = new ServiceBroker({
	transporter: 'redis://localhost:6379/0',
	logLevel: 'warn',
	requestTimeout: 15 * 1000, // in millisecs
	logger: console,
});

describe('Test multsig.create', () => {
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe('Connect to client and create multisignature transaction', () => {
		it('call transaction.multisig.create', async () => {
			const result = await broker.call('transaction.multisig.create', {});
			if (result.data.error) {
				serviceUnavailableSchema.validate(result);
			} else {
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data.length).toBeGreaterThanOrEqual(1);
				result.data.forEach(tx => transactionSchema.validate(tx));
			}
		});
	});
});
