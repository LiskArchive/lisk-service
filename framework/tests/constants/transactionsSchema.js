/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
module.exports = {
    tableName: 'transactions',
    primaryKey: 'id',
    charset: 'utf8mb4',
    schema: {
        id: { type: 'string', null: false },
        height: { type: 'integer', null: false },
        moduleCommand: { type: 'string', null: false },
        nonce: { type: 'integer', null: false },
        blockID: { type: 'string', null: false },
        timestamp: { type: 'integer', null: false },
        tokenID: { type: 'string', null: true, default: null },
        amount: { type: 'bigInteger', null: true, default: null },
        messageFee: { type: 'bigInteger', null: true, default: null },
        data: { type: 'string', null: true, default: null },
        fee: { type: 'bigInteger', null: false },
    },
    indexes: {
    },
    purge: {},
};
