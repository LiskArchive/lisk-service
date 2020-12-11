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
const { Logger } = require('lisk-service-framework');

const config = require('../../config');

const logger = Logger();

const getDbInstance = async (collectionName) => {
    const db = new redis(config.endpoints.redis);
    const { indexes } = config.db.collections[collectionName];

    db.on('error', (err) => logger.error('connection issues ', err));

    const write = async (doc) => {
        // Secondary indexes mapping properties to entity IDs
        indexes.forEach(prop => {
            if (['timestamp'].includes(prop)) db.zadd(collectionName, Number(doc[prop]), doc.id);
            else if (doc[prop]) db.hmset(`${collectionName}_${prop}`, doc[prop], doc.id);
        });
        return db.hmset(collectionName, doc.id, JSON.stringify(doc));
    };

    const writeBatch = async (docs) => Promise.all(docs.map(async doc => write(doc)));

    const findById = async (id) => new Promise(resolve => {
        db.hgetall(collectionName, async (err, result) => {
            const res = [];
            if (result && result[id]) res.push(JSON.parse(result[id]));
            return resolve(res);
        });
    });

    const find = async (params) => new Promise((resolve) => {
        const filterByParams = (item, lParams) => {
            const paramMatches = Object.entries(lParams)
                .filter(([, v]) => v)
                .map(([k, v]) => item[k] === v);
            return paramMatches.reduce((a, b) => a && b, true);
            // return !paramMatches.some(isMatch => !isMatch);
        };

        db.hgetall(collectionName, async (err, result) => {
            let res = Object.keys(result).map((key) => JSON.parse(result[key]));
            res = res.filter(item => filterByParams(item, params.selector));
            return resolve(res);
        });
    });

    const findAll = async () => new Promise(resolve => {
        db.hgetall(collectionName, async (err, result) => {
            const res = Object.values(result).map(v => JSON.parse(v));
            return resolve(res);
        });
    });

    const searchByIndex = async (indexName, id) => new Promise(resolve => {
        db.hgetall(indexName, async (err, result) => resolve(result[id]));
    });

    return {
        write,
        // writeOnce,
        writeBatch,
        findAll,
        find,
        findById,
        // findOneByProperty,
        // deleteById,
        // deleteBatch,
        // deleteByProperty,
        // getCount,
        searchByIndex,
    };
};

module.exports = getDbInstance;
