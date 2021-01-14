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
const { createWSClient } = require('@liskhq/lisk-api-client');
const config = require('../../../../config');

const liskAddress = config.endpoints.liskWs;
let clientCache;

const getClient = async () => {
    try {
        if (!clientCache || !clientCache._channel.isAlive) {
            clientCache = await createWSClient(`${liskAddress}/ws`);
        }
        return clientCache;
    } catch (err) {
        return {
            data: { error: 'Action not supported' },
            status: 'METHOD_NOT_ALLOWED',
        };
    }
};

module.exports = {
    getClient,
};
