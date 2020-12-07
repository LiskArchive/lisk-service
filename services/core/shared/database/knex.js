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

const createDb = async (dbDataDir, tableName) => {
    // TODO: Must be config based
    const client = 'sqlite3';

    // TODO: Update connection object based on client
    const connection = { filename: `./${dbDataDir}/${tableName}_db.sqlite3` };

    const knex = require('knex')({
        client,
        connection,
        useNullAsDefault: true,
        log: {
            warn(message) { logger.warn(message); },
            error(message) { logger.error(message); },
            deprecate(message) { logger.deprecate(message); },
            debug(message) { logger.debug(message); },
        },
        migrations: {
            directory: './shared/database/knex_migrations',
            loadExtensions: ['.js'],
        },
    });

    return knex;
};

const getDbInstance = async (tableName) => {
    if (!connectionPool[tableName]) {
        const dbDataDir = config.db.defaults.directory;
        if (!fs.existsSync(dbDataDir)) fs.mkdirSync(dbDataDir, { recursive: true });

        connectionPool[tableName] = await createDb(dbDataDir, tableName);
        await connectionPool[tableName].migrate.latest();
    }

    const knex = connectionPool[tableName];

    const writeBatch = async (rows) => {
        const ids = await Promise.all(rows.map(row => knex(tableName).insert(row).onConflict(['id']).merge()));
        logger.debug(`Inserted data with ids: ${ids}`);
        return ids;
    };

    return {
        writeBatch,
    };
};

module.exports = getDbInstance;
