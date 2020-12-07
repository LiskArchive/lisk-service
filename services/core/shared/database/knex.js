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

    const write = async (row) => knex.transaction(async trx => {
        const inserts = await trx(tableName).insert(row).onConflict(['id']).merge().transacting(trx);

        logger.debug(inserts.length + ` ${tableName} saved/updated.`);
        return inserts;
    });

    const writeOnce = async (row) => write(row);

    const writeBatch = async (rows) => knex.transaction(async trx => {
        const inserts = await Promise.all(rows.map(row =>
            trx(tableName).insert(row).onConflict(['id']).merge().transacting(trx)));

        logger.debug(inserts.length + ` ${tableName} saved/updated.`);
        return inserts;
    });

    const findAll = async () => knex.select().table(tableName);

    const find = async (params) => {
        const whereParams = params.selector;
        const res = await knex.select().table(tableName).where(whereParams);
        return res;
    };

    const findById = async (id) => {
        const params = { selector: { id } };
        return find(params);
    };

    const findOneByProperty = async (property, value) => {
        const selector = {};
        selector[property] = value;
        return find({ selector });
    };

    const deleteByProperty = async (property, value) => {
        const whereParams = {};
        whereParams[property] = value;
        return knex(tableName).where(whereParams).del();
    };

    const deleteById = async (id) => deleteByProperty('id', id);

    const deleteBatch = async (rows) => {
        if (rows instanceof Array && rows.length === 0) return null;
        return knex(tableName).delete().whereIn('id', rows.map(row => row.id));
    };

    const getCount = async () => (await db.info()).doc_count;

    return {
        write,
        writeOnce,
        writeBatch,
        findAll,
        findById,
        find,
        findOneByProperty,
        deleteById,
        deleteBatch,
        deleteByProperty,
        getCount,
    };
};

module.exports = getDbInstance;
