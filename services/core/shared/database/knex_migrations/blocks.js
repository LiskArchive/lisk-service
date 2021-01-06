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

const tableName = config.db.collections.blocks.name;

exports.up = knex => knex.schema
    .createTable(tableName, table => {
        // Indexed properties
        table.string('id').primary();
        table.integer('height').notNullable().index();
        table.integer('unixTimestamp').notNullable().index();
        table.string('generatorAddress').notNullable().index();
        table.string('generatorPublicKey').index();

        // Non-indexed properties
        table.string('blockSignature');
        table.integer('numberOfTransactions');
        table.string('payloadHash');
        table.integer('payloadLength');
        table.string('previousBlockId');
        table.string('reward');
        table.string('totalAmount');
        table.string('totalFee');
        table.string('totalForged');
        table.integer('version');
    });

exports.down = knex => knex.schema.dropTable(tableName);

exports.config = { transaction: false };
