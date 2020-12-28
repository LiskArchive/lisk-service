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
const redis = require('ioredis');

const getDbInstance = async (collectionName, indexes = []) => {
    const db = new redis('redis://localhost:6379/10');

    db.on('error', (err) => console.error('Connection issues: ', err));

    const write = async (doc) => {
        // Secondary indexes mapping properties to entity IDs
        indexes.forEach(prop => {
            if (['timestamp'].includes(prop)) db.zadd(collectionName, Number(doc[prop]), doc.id);
            else if (doc[prop]) db.hmset(`${collectionName}_${prop}`, doc[prop], doc.id);
        });
        return db.hmset(collectionName, doc.id, JSON.stringify(doc));
    };

    const writeOnce = async (doc) => write(doc);

    const writeBatch = async (docs) => Promise.all(docs.map(async doc => write(doc)));

    const findAll = async () => new Promise(resolve => {
        db.hgetall(collectionName, async (err, result) => {
            const res = Object.values(result).map(v => JSON.parse(v));
            return resolve(res);
        });
    });

    const find = async (params) => {
        const offset = params.offset || 0;
        const limit = params.limit || 10;

        delete params.offset;
        delete params.limit;

        // TODO: Remove after PouchDB specific code is removed from the shared layer
        if (params.selector) params = params.selector;

        const filterByParams = (item, lParams) => {
            const paramMatches = Object.entries(lParams)
                .filter(([, v]) => v)
                .map(([k, v]) => item[k] === v);
            return paramMatches.reduce((a, b) => a && b, true);
            // return !paramMatches.some(isMatch => !isMatch);
        };

        const result = await findAll();

        const parsedResult = Object.keys(result).map((key) => JSON.parse(result[key]));
        const filteredResult = parsedResult.filter(item => filterByParams(item, params));

        return filteredResult.slice(offset, offset + limit);
    };

    const findById = async (id) => new Promise(resolve => {
        db.hget(collectionName, id, async (err, result) => {
            const res = [];
            if (result && result[id]) res.push(JSON.parse(result[id]));
            return resolve(res);
        });
    });

    const findOneByProperty = async (prop, value) => {
        if (indexes.includes(prop)) {
            const id = ['timestamp'].includes(prop)
                ? await db.zrangebyscore(collectionName, value, value, 'LIMIT', 0, 1)
                : await db.hget(`${collectionName}_${prop}`, value);

            return findById(id);
        }

        const params = {};
        params[prop] = value;
        return find(params);
    };

    const deleteById = async (id) => db.hdel(collectionName, id);

    const deleteBatch = async (docs) => {
        if (docs instanceof Array && docs.length === 0) return null;
        return db.del(collectionName);
    };

    const deleteByProperty = async (prop, value) => {
        if (indexes.includes(prop)) {
            const id = ['timestamp'].includes(prop)
                ? await db.zrangebyscore(collectionName, value, value, 'LIMIT', 0, 1)
                : await db.hget(`${collectionName}_${prop}`, value);

            db.hdel(`${collectionName}_${prop}`, value);

            return deleteById(id);
        }

        const params = {};
        params[prop] = value;
        const [entry] = await find(params);

        return entry.id ? deleteById(entry.id) : 0;
    };

    const getCount = () => db.hlen(collectionName);

    const searchByIndex = async (indexName, id) => new Promise(resolve => {
        db.hgetall(indexName, async (err, result) => resolve(result[id]));
    });

    return {
        write,
        writeOnce,
        writeBatch,
        findAll,
        find,
        findById,
        findOneByProperty,
        deleteById,
        deleteBatch,
        deleteByProperty,
        getCount,
        searchByIndex,
    };
};

module.exports = getDbInstance;
