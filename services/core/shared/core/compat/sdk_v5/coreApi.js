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
const { getApiClient } = require('../common/wsRequest');

const getNetworkStatus = async () => {
    const apiClient = await getApiClient();
    const result = await apiClient.node.getNodeInfo();
    return { data: result };
};

const getBlocks = async params => {
    const apiClient = await getApiClient();
    let block;
    let blocks;

    if (params.blockId) {
        block = await apiClient.block.get(params.blockId);
    } else if (params.blockIds) {
        blocks = await apiClient._channel.invoke('app:getBlocksByIDs', { ids: params.blockIds });
    } else if (params.height) {
        block = await apiClient.block.getByHeight(params.height);
    } else if (params.heightRange) {
        blocks = await apiClient._channel.invoke('app:getBlocksByHeightBetween', params.heightRange);
    } else if (params.limit === 1 && Object.getOwnPropertyNames(params).length === 1) {
        block = await apiClient._channel.invoke('app:getLastBlock');
        block = apiClient.block.decode(block);
    }

    if (blocks) blocks = blocks.map(blk => apiClient.block.decode(blk));
    const result = blocks || [block];
    return { data: result };
};

const getAccounts = async params => {
    const apiClient = await getApiClient();
    let account;
    let accounts;

    if (params.address) {
        account = await apiClient.account.get(params.address);
    } else if (params.blockIds) {
        accounts = await apiClient._channel.invoke('app:getAccounts', { address: params.addresses });
    }

    if (accounts) accounts = accounts.map(acc => apiClient.account.decode(acc));
    const result = accounts || [account];
    return { data: result };
};

module.exports = {
    getBlocks,
    getAccounts,
    getNetworkStatus,
};
