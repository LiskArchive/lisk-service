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
const tableName = 'users';

exports.up = knex => knex.schema
    .createTable(tableName, table => {
        table.string('id').primary();
        table.string('btcAddress').notNullable();
        table.string('name');
        table.string('username');
        table.string('avatar');
        table.string('email');
        table.string('dob');
        table.string('phone');
        table.string('address_street');
        table.string('address_suite');
        table.string('address_city');
        table.string('address_zipcode');
        table.string('address_geo_lat');
        table.string('address_geo_lng');
        table.string('website');
        table.string('company_name');
        table.string('company_catchPhrase');
        table.string('company_bs');
    });

exports.down = knex => knex.schema.dropTable(tableName);

exports.config = { transaction: false };
