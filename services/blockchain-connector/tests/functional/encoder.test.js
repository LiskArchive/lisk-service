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
const {
	encodeBlock,
	encodeTransaction,
} = require('../../shared/sdk/encoder');

const {
	block,
	blockWithTransaction,
	encodedBlock,
	encodedBlockWithTransaction,
} = require('../constants/blocks');

const {
	transaction,
	encodedTransaction,
} = require('../constants/transactions');

describe('Function tests for encoder', () => {
	it('encodeBlock without transactions', async () => {
		const result = encodeBlock(block);
		expect(typeof result).toBe('string');
		expect(result).toEqual(encodedBlock);
	});

	it('encodeBlock with transactions', async () => {
		const result = encodeBlock(blockWithTransaction);
		expect(typeof result).toBe('string');
		expect(parsedResult).toEqual(encodedBlockWithTransaction);
	});

	it('encodeTransaction', async () => {
		const result = encodeTransaction(transaction);
		expect(typeof result).toBe('string');
		expect(parsedResult).toEqual(encodedTransaction);
	});
});
