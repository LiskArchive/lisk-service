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
const { Logger } = require('lisk-service-framework');
const { getApiClient } = require('../common/wsRequest');

const logger = Logger();

const getNetworkStatus = async () => {
    const apiClient = await getApiClient();
    const result = await apiClient.node.getNodeInfo();
    return { data: result };
};

const getBlockByID = async id => {
    const apiClient = await getApiClient();
    const block = await apiClient.block.get(id);
    return { data: [block] };
};

const getBlocksByIDs = async ids => {
    const apiClient = await getApiClient();
    const encodedBlocks = await apiClient._channel.invoke('app:getBlocksByIDs', { ids });
    const blocks = encodedBlocks.map(blk => apiClient.block.decode(Buffer.from(blk, 'hex')));
    return { data: blocks };
};

const getBlockByHeight = async height => {
    const apiClient = await getApiClient();
    const block = await apiClient.block.getByHeight(height);
    return { data: [block] };
};

const getBlocksByHeightBetween = async (from, to) => {
    const apiClient = await getApiClient();
    const encodedBlocks = await apiClient._channel.invoke('app:getBlocksByHeightBetween', { from, to });
    const blocks = encodedBlocks.map(blk => apiClient.block.decode(Buffer.from(blk, 'hex')));
    return { data: blocks };
};

const getLastBlock = async () => {
    const apiClient = await getApiClient();
    const encodedBlock = await apiClient._channel.invoke('app:getLastBlock');
    const block = apiClient.block.decode(Buffer.from(encodedBlock, 'hex'));
    return { data: [block] };
};

const getTransactions = async params => {
    const apiClient = await getApiClient();
    let transaction;
    let transactions;

    if (params.id) {
        transaction = await apiClient.transaction.get(params.id);
    } else if (params.ids) {
        transactions = await apiClient._channel.invoke('app:getTransactionsByIDs', { ids: params.ids });
    }

    if (transactions) transactions = transactions.map(tx => apiClient.transaction.decode(Buffer.from(tx, 'hex')));
    const result = transactions || [transaction];
    return { data: result };
};

const getAccountByAddress = async address => {
    const apiClient = await getApiClient();
    try {
        const account = await apiClient.account.get(address);
        return { data: [account] };
    } catch (err) {
        logger.warn(`The following address is not present in the blockchain: ${address}. It might be not fully synced on the Lisk Core/SDK end.`);
        throw new Error('MISSING_ACCOUNT_IN_BLOCKCHAIN');
    }
};

const getAccountsByAddresses = async addresses => {
    const apiClient = await getApiClient();
    const encodedAccounts = await apiClient._channel.invoke('app:getAccounts', { address: addresses });
    const accounts = encodedAccounts.map(acc => apiClient.account.decode(Buffer.from(acc, 'hex')));
    return { data: accounts };
};

const getPeers = async (state = 'connected') => {
    const apiClient = await getApiClient();

    const peers = state === 'connected'
        ? await apiClient._channel.invoke('app:getConnectedPeers')
        : await apiClient._channel.invoke('app:getDisconnectedPeers');

    return { data: peers };
};

const getForgers = async () => {
    const apiClient = await getApiClient();
    const forgers = await apiClient._channel.invoke('app:getForgers', {});
    return { data: forgers };
};

module.exports = {
    getBlockByID,
    getBlocksByIDs,
    getBlockByHeight,
    getBlocksByHeightBetween,
    getLastBlock,
    getAccountByAddress,
    getAccountsByAddresses,
    getNetworkStatus,
    getTransactions,
    getPeers,
    getForgers,
};
