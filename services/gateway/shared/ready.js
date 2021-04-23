/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const BluebirdPromise = require('bluebird');

const { MoleculerError } = require('moleculer').Errors;

const currentStatus = {
    indexReadyStatus: false,
    transactionStatsStatus: false,
};

const getReady = async broker => {
    const coreMethods = {
        lisk_accounts: 'core.accounts',
        // lisk_blocks: 'core.blocks',
        lisk_transactions: 'core.transactions',
        // lisk_peers: 'core.peers',
    };
    try {
        const services = await BluebirdPromise.map(
            Object.getOwnPropertyNames(coreMethods),
            async key => {
                const service = {};
                const response = await broker.call(coreMethods[key], { limit: 10 });
                service[key] = !!response.data;
                return service;
            },
        );
        const servicesStatus = Object.keys(Object.assign(currentStatus, ...services))
            .some(value => !Object.assign(currentStatus, ...services)[value]);
        if (servicesStatus === false) return Promise.resolve({
            services: Object.assign(currentStatus, ...services),
        });
        return Promise.reject(new MoleculerError('503 Not available', 503, 'ERR_SOMETHING'));
    } catch (_) {
        return Promise.reject(new MoleculerError('503 Not available', 503, 'ERR_SOMETHING'));
    }
};

const updateSvcStatus = async data => {
    const { isIndexReady, isTransactionStatsReady } = data;
    currentStatus.indexReadyStatus = isIndexReady;
    currentStatus.transactionStatsStatus = isTransactionStatsReady;
};


module.exports = {
    getReady,
    updateSvcStatus,
};
