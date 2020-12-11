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

    db.on('error', (err) => logger.error('connection issues ', err));

    const write = async (doc) => db.set(doc.id, JSON.stringify(doc));

    const writeBatch = async (docs) => {
        await Promise.all(docs.map(doc => {
            // // For accounts, delegates
            if (doc.publicKey) db.hmset(`${collectionName}_publicKeyToId`, doc.publicKey, doc.id);
            if (doc.secondPublicKey) db.hmset(`${collectionName}_secPubKeyToId`, doc.secondPublicKey, doc.id);
            if (doc.username) db.hmset(`${collectionName}_usernameToId`, doc.username, doc.id);

            // For blocks, transactions
            // if (doc.generatorAddress) db.zadd(collectionName, doc.generatorAddress, doc.id);
            // if (doc.generatorPublicKey) db.zadd(collectionName, doc.generatorPublicKey, doc.id);
            // if (doc.generatorUsername) db.zadd(collectionName, doc.generatorUsername, doc.id);
            if (doc.height) db.zadd(collectionName, doc.height, doc.id);
            if (doc.timestamp) db.zadd(collectionName, doc.timestamp, doc.id);

            // // For transactions
            if (doc.blockId) db.zadd(collectionName, Number(doc.blockId), doc.id);
            // if (doc.type) db.zadd(collectionName, doc.type, doc.id);
            // if (doc.senderId) db.zadd(collectionName, doc.senderId, doc.id);
            // if (doc.senderPublicKey) db.zadd(collectionName, doc.senderPublicKey, doc.id);
            // if (doc.senderSecondPublicKey) db
            //     .zadd(collectionName, doc.senderSecondPublicKey, doc.id);
            // if (doc.recipientId) db.zadd(collectionName, doc.recipientId, doc.id);
            // if (doc.recipientPublicKey) db.zadd(collectionName, doc.recipientPublicKey, doc.id);

            // // For peers
            // if (doc.ip) db.zadd(collectionName, doc.ip, doc.id);

            // for storing all accounts with data store accounts
            return db.hmset(collectionName, doc.id, JSON.stringify(doc));
        }));
    };

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
        find,
        writeBatch,
        findAll,
        findById,
        searchByIndex,
    };
};

module.exports = getDbInstance;
