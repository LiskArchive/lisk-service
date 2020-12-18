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
const createDb = async () => {
    const knex = require('knex')({
        client: 'mysql',
        version: '5.7',
        connection: {
            host: '127.0.0.1',
            user: 'lisk',
            password: 'password',
            database: 'lisk',
        },
        // useNullAsDefault: true,
        log: {
            warn(message) { console.warn(message); },
            error(message) { console.error(message); },
            deprecate(message) { console.deprecate(message); },
            debug(message) { console.debug(message); },
        },
        migrations: {
            directory: './database/knex_migrations',
            loadExtensions: ['.js'],
        },
    });

    await knex.migrate.latest();

    return knex;
};

let dbConnection = null;

const getDbInstance = async (tableName) => {
    if (!dbConnection) dbConnection = await createDb();

    const knex = dbConnection;

    const write = async (row) => knex.transaction(async trx => {
        const inserts = await trx(tableName).insert(row).onConflict('id').merge()
            .transacting(trx);
        console.info(`${inserts.length} row inserted/updated in '${tableName}' table`);
        return inserts;
    });

    const writeOnce = async (row) => write(row);

    const writeBatch = async (rows) => {
        try {
            const chunkSize = 1000;
            const ids = await knex.batchInsert(tableName, rows, chunkSize);
            console.info(`${rows.length} row(s) inserted/updated in '${tableName}' table`);
            return ids;
        } catch (error) {
            const errCode = error.code;
            const errMessage = error.message.split(`${errCode}: `)[1] || error.message;
            const errCause = errMessage.split(': ')[0];
            console.debug('Encountered error with batch insert:', errCause,
                '\nRe-attempting to update/merge the conflicted transactions one at a time: ');

            return knex.transaction(async trx => {
                const inserts = await Promise.all(rows.map(row => trx(tableName).insert(row).onConflict('id').merge()
                    .transacting(trx)));
                console.info(`${rows.length} row(s) inserted/updated in '${tableName}' table`);
                return inserts;
            });
        }
    };

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

    const getCount = async () => knex(tableName).count({ count: '*' });

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
