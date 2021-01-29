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
const tableName = 'accounts';

exports.up = knex => knex.schema
    .createTable(tableName, table => {
        // Indexed properties
        table.string('address').primary();
        table.string('publicKey').notNullable().index();
        table.boolean('isDelegate').notNullable().index();
        table.bigInteger('balance').notNullable().index();
        table.string('username').index();
    });

exports.down = knex => knex.schema.dropTable(tableName);

exports.config = { transaction: false };
