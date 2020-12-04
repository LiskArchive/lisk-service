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

const createDb = async (dbDataDir, tableName, idxList = []) => {
    // TODO: Must be config based
    const client = 'sqlite3';

    // TODO: Update connection object based on client
    const connection = { filename: `./${dbDataDir}/${tableName}_db.sqlite` };

    const db = require('knex')({
        client,
        connection,
        pool: {
            afterCreate: (conn, done) => conn.query('SET timezone="UTC";', (err) => {
                if (err) done(err, conn);
                conn.query('SELECT set_limit(0.01);', (err) => done(err, conn));
            }),
        },
        log: {
            warn(message) { logger.warn(message); },
            error(message) { logger.error(message); },
            debug(message) { logger.debug(message); },
        },
    });

    return db;
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
