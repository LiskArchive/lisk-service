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
const { Logger } = require('lisk-service-framework');
const coreApi = require('./compat');

const logger = Logger();
const sdkVersion = coreApi.getSDKVersion();

let nextForgers = [];

const getForgers = async params => {
    const forgers = {
        data: [],
        meta: {},
    };

    const offset = params.offset || 0;
    const limit = params.limit || 10;
    forgers.data = nextForgers.slice(offset, offset + limit);

    forgers.meta.count = forgers.data.length;
    forgers.meta.offset = offset;
    forgers.meta.total = nextForgers.length;

    return forgers;
};


const loadAllNextForgers = async (forgers = []) => {
    const maxCount = (sdkVersion < 4) ? 101 : 103;
    const response = await coreApi.getForgers({ limit: maxCount, offset: nextForgers.length });
    forgers = [...forgers, ...response.data];
    if (forgers.length >= nextForgers.length) {
        nextForgers = forgers;
    }
    if (response.data.length !== maxCount) {
        loadAllNextForgers(forgers);
    } else {
        logger.info(`Initialized/Updated next forgers cache with ${nextForgers.length} delegates.`);
    }
};

const reloadForgersCache = () => loadAllNextForgers();

module.exports = {
    getForgers,
    reloadForgersCache,
};
