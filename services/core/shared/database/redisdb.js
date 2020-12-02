/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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

    db.on('error', (err) => {
        logger.error('connection issues ', err);
    });

    const write = async (doc) => {
        await db.set(doc.id, JSON.stringify(doc));
    };

    const writeBatch = async (docs) => {
        await Promise.all(docs.map(doc => {
            db.hmset(collectionName, doc.id, JSON.stringify(doc));

            // For accounts, delegates
            if (doc.publicKey) db.zadd(collectionName, doc.publicKey, doc.id);
            if (doc.secondPublicKey) db.zadd(collectionName, doc.secondPublicKey, doc.id);
            if (doc.username) db.zadd(collectionName, doc.username, doc.id);

            // For blocks, transactions
            if (doc.generatorAddress) db.zadd(collectionName, doc.generatorAddress, doc.id);
            if (doc.generatorPublicKey) db.zadd(collectionName, doc.generatorPublicKey, doc.id);
            if (doc.generatorUsername) db.zadd(collectionName, doc.generatorUsername, doc.id);
            if (doc.height) db.zadd(collectionName, doc.height, doc.id);
            if (doc.timestamp) db.zadd(collectionName, doc.timestamp, doc.id);

            // For transactions
            if (doc.blockId) db.zadd(collectionName, Number(doc.blockId), doc.id);
            if (doc.type) db.zadd(collectionName, doc.type, doc.id);
            if (doc.senderId) db.zadd(collectionName, doc.senderId, doc.id);
            if (doc.senderPublicKey) db.zadd(collectionName, doc.senderPublicKey, doc.id);
            if (doc.senderSecondPublicKey) db.zadd(collectionName, doc.senderSecondPublicKey, doc.id);
            if (doc.recipientId) db.zadd(collectionName, doc.recipientId, doc.id);
            if (doc.recipientPublicKey) db.zadd(collectionName, doc.recipientPublicKey, doc.id);

            // For peers
            if (doc.ip) db.zadd(collectionName, doc.ip, doc.id);
        }));
    };

    const findById = (id) => new Promise(resolve => {
        db.hgetall(collectionName, async (err, result) => {
            const res = {};
            if (result && result[id]) {
                Object.assign(res, JSON.parse(result[id]));
                return resolve([res]);
            }
            return resolve([]);
        });
    });

    const find = (params) => new Promise((resolve) => {
        db.hgetall(collectionName, async (err, result) => {
            let res = Object.keys(result).map((key) => JSON.parse(result[key]));
            res = res.filter(
                (item) => (item.address && item.address === params.selector.address)
                    || (item.publicKey && item.publicKey === params.selector.publicKey)
                    || (item.secondPublicKey
                        && item.secondPublicKey === params.selector.secondPublicKey)
                    || (item.username && item.username === params.selector.username),
            );
            return resolve(res);
        });
    });

    const findAll = () => new Promise(resolve => {
        db.hgetall(collectionName, async (err, result) => {
            const res = Object.keys(result).map((key) => JSON.parse(result[key]));
            return resolve(res);
        });
    });

    return {
        write,
        find,
        writeBatch,
        findAll,
        findById,
    };
};
module.exports = getDbInstance;
