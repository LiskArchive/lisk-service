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
const redis = require('redis');
const { Logger } = require('lisk-service-framework');

const config = require('../../config');

const logger = Logger();

const getDbInstance = async (
    collectionName,
    endpoint = config.endpoints.redis,
) => {
    const db = redis.createClient(endpoint);
    const collection = config.db.collections[collectionName];
    db.on('error', (err) => logger.error('connection issues ', err));

    const upsert = async docs => docs.forEach(async doc => db
        .hmset(collectionName, doc[collection.primaryKey], JSON.stringify(doc)));

    const find = async params => new Promise(resolve => {
        db.hgetall(collectionName, async (err, result) => {
            if (err) logger.error(`Error retrieving ${collectionName} data: `, err);

            let res = Object.values(result).map(v => JSON.parse(v));

            if (params.where) {
                const { property, values } = params.where;
                res = res.filter(acc => acc[property] === values);
            }

            if (params.offset) res = res.splice(Number(params.offset));
            if (params.limit) res = res.slice(0, Number(params.limit));

            return resolve(res);
        });
    });

    const count = () => db.hlen(collectionName);

    return {
        upsert,
        find,
        count,
    };
};

module.exports = getDbInstance;
