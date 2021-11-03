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
const {
	computeServiceId,
} = require('../../shared/transactionUtils');

const {
	inputTransaction,
	inputTransactionServiceId,
} = require('../constants/multisignature');

describe('Test the transaction utilities', () => {
	describe('Verify computeServiceId', () => {
		it('same serviceId is calculated with same inputs', async () => {
			const serviceId = computeServiceId(inputTransaction);
			expect(serviceId.length).toBe(64);
			expect(serviceId).toBe(inputTransactionServiceId);
		});

		it('serviceId varies with modified inputs', async () => {
			const serviceId = computeServiceId({
				...inputTransaction,
				nonce: String(Number(inputTransaction.nonce) + 1),
			});
			expect(serviceId.length).toBe(64);
			expect(serviceId).not.toEqual(inputTransactionServiceId);
		});
	});
});
