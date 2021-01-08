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
const { getClient } = require('../common/wsRequest');

const getApiClient = async () => {
    const wsClient = await getClient();
    return wsClient;
};

const getNetworkStatus = async () => {
    const apiClient = await getApiClient();
    const result = await apiClient.node.getNodeInfo();
    return { data: result };
};

const getBlocks = async params => {
    const apiClient = await getApiClient();
    let block, blocks;
    if (params.id) {
        block = await apiClient.block.get({ id: params.id });
    } else if (params.ids) {
        blocks = await apiClient._channel
            .invoke('app:getBlocksByIDs', { ids: params.ids });
    } else if (params.height) {
        block = await apiClient.block.getBlockByHeight({ height: params.height });
    } else if (params.heightRange) {
        blocks = await apiClient._channel
            .invoke('app:getBlocksByHeightBetween', params.heightRange);
    }
    if (blocks) blocks = blocks.map(block => apiClient.block.decode(block));
    const result = blocks ? blocks : [block];
    return { data: result };
};

module.exports = {
    getBlocks,
    getNetworkStatus,
};
