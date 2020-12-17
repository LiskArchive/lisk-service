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
const config = require('../../config');

const databases = {
    Redis: 'redisdb',
    PouchDB: 'pouchdb',
};

let db;
Object.keys(databases).forEach(key => {
    if (key === `${config.defaultDB}`) db = databases[key];
});
/* eslint-disable-next-line import/no-dynamic-require */
module.exports = require(`./${db}`);
