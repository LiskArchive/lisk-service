/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const config = require('../../../config');

const tableName = config.db.collections.transactions.name;

exports.up = knex => knex.schema
    .createTable(tableName, table => {
        table.string('id').primary();
        table.string('amount');
        table.string('fee');
        table.integer('type');
        table.integer('height');
        table.string('nonce');
        table.string('blockId');
        table.integer('timestamp');
        table.string('senderId');
        table.string('senderPublicKey');
        table.string('recipientId');
        // table.string('signatures');
        table.integer('confirmations');
        // table.string('asset');
    });

exports.down = knex => knex.schema.dropTable(tableName);

exports.config = { transaction: false };
