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

const createAPIClient = async () => {
    // const client = await createIPCClient('~/.lisk/lisk-core');
    const client = await createWSClient('wss://api.lisk-service.io');
    return client;
};

const getNetworkStatus = async () => {
    const apiClient = await createAPIClient();
    const result = await apiClient.node.getNodeInfo();
    return result;
};

module.exports = {
    getNetworkStatus,
};
