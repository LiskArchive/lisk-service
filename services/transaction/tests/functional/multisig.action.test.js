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
const { serviceUnavailableSchema } = require('../schemas/api_v2/serviceUnavailable.schema');
const { inputTransaction } = require('../constants/multisignature');

const broker = new ServiceBroker({
	transporter: 'redis://localhost:6379/0',
	logLevel: 'warn',
	requestTimeout: 15 * 1000, // in millisecs
	logger: console,
});

describe('Test multsig actions', () => {
	let serviceId;
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe('Connect to client and create multisignature transaction', () => {
		it('call transaction.multisig.create', async () => {
			const result = await broker.call('transaction.multisig.create', inputTransaction);
			serviceId = result.data[0].serviceId;
			if (result.data.error) {
				serviceUnavailableSchema.validate(result);
			} else {
				expect('data' in result).toBe(true);
				expect('meta' in result).toBe(true);
				expect(result.data).toBeInstanceOf(Array);
				expect(result.meta).toBeInstanceOf(Object);
			}
		});

		it('call transaction.multisig', async () => {
			const result = await broker.call('transaction.multisig', {});
			if (result.data.error) {
				serviceUnavailableSchema.validate(result);
			} else {
				expect('data' in result).toBe(true);
				expect('meta' in result).toBe(true);
				expect(result.data).toBeInstanceOf(Array);
				expect(result.meta).toBeInstanceOf(Object);
			}
		});

		it('call transaction.multisig.reject', async () => {
			const result = await broker.call('transaction.multisig.reject', {
				serviceId,
				signatures: inputTransaction.signatures,
			});
			if (result.data.error) {
				serviceUnavailableSchema.validate(result);
			} else {
				expect('data' in result).toBe(true);
				expect('meta' in result).toBe(true);
				expect(result.data).toBeInstanceOf(Array);
				expect(result.data[0].rejected).toBe(true);
				expect(result.meta).toBeInstanceOf(Object);
			}
		});
	});
});
