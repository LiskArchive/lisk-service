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
    decodeBlock,
    decodeTransaction,
} = require('../../shared/sdk/decoder');

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

describe('Functional tests for decoder', () => {
    it('decodeBlock without transactions', async () => {
        const result = decodeBlock(encodedBlock);
        expect(result).toMatchObject(block);
    });

    it('decodeBlock with transactions', async () => {
        const result = decodeBlock(encodedBlockWithTransaction);
        expect(result).toMatchObject(blockWithTransaction);
    });

    it('decode Transaction', async () => {
        const result = decodeTransaction(encodedTransaction);
        expect(result).toMatchObject(transaction);
    });
});
