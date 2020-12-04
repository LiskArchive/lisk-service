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
const fs = require('fs');
const { Logger } = require('lisk-service-framework');
const config = require('../../config');

const logger = Logger();

const connectionPool = {};

const createTable = async (knex, tableName) => {
    const tableSchema = config.db.tables[tableName].schema;

    return knex.schema.hasTable(tableName)
        .then(exists => {
            if (exists) return;
            return knex.schema
                .withSchema(tableSchema)
                .createTable(tableName, function (table) {

                });
        });
};

const createDb = async (dbDataDir, tableName, idxList = []) => {
    // TODO: Must be config based
    const client = 'sqlite3';

    // TODO: Update connection object based on client
    const connection = { filename: `./${dbDataDir}/${tableName}_db.sqlite3` };

    const knex = require('knex')({
        client,
        connection,
        log: {
            warn(message) { logger.warn(message); },
            error(message) { logger.error(message); },
            debug(message) { logger.debug(message); },
        },
        migrations: {
            directory: './knex_migrations',
            loadExtensions: ['.js'],
        },
    });

    return knex;
};

const getDbInstance = async (tableName) => {
    if (!connectionPool[tableName]) {
        const dbDataDir = config.db.default.directory;
        if (!fs.existsSync(dbDataDir)) fs.mkdirSync(dbDataDir, { recursive: true });
    }

    connectionPool[collectionName] = await createDb(dbDataDir, tableName, [
        ...config.db.collections[collectionName].indexes,
        ...idxList,
    ]);

    return connectionPool[tableName];
};

module.exports = getDbInstance;
