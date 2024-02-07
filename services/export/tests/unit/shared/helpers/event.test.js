/*
 * LiskHQ/lisk-service
 * Copyright © 2024 Lisk Foundation
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
	getCcmIDFromTopic0,
	getTransactionIDFromTopic0,
} = require('../../../../shared/helpers/event');

describe('Event utils', () => {
	it('returns ccmID when called with valid topic (ccmID with prefix)', async () => {
		const topic = '05ce7082673acce922263e0256e717dc151fe86a88c6827bf53d42038ee387eca1';
		const ccmID = getCcmIDFromTopic0(topic);
		const expectedResponse = 'ce7082673acce922263e0256e717dc151fe86a88c6827bf53d42038ee387eca1';
		expect(ccmID).toBe(expectedResponse);
	});

	it('returns null when called with ccmID without prefix', async () => {
		const topic = 'ce7082673acce922263e0256e717dc151fe86a88c6827bf53d42038ee387eca1';
		const ccmID = getCcmIDFromTopic0(topic);
		expect(ccmID).toBeNull();
	});

	it('returns transactionID when called with valid topic (transactionID with prefix)', async () => {
		const topic = '04ce7082673acce922263e0256e717dc151fe86a88c6827bf53d42038ee387eca1';
		const transactionID = getTransactionIDFromTopic0(topic);
		const expectedResponse = 'ce7082673acce922263e0256e717dc151fe86a88c6827bf53d42038ee387eca1';
		expect(transactionID).toBe(expectedResponse);
	});

	it('returns null when called with transactionID without prefix', async () => {
		const topic = 'ce7082673acce922263e0256e717dc151fe86a88c6827bf53d42038ee387eca1';
		const ccmID = getTransactionIDFromTopic0(topic);
		expect(ccmID).toBeNull();
	});
});
