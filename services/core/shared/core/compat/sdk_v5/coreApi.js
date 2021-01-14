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

const getTransactions = async params => {
    const apiClient = await getApiClient();
    let transaction;
    let transactions;

    if (params.id) {
        transaction = await apiClient.transaction.get(params.id);
    } else if (params.ids) {
        transactions = await apiClient._channel.invoke('app:getTransactionsByIDs', { ids: params.ids });
    }

    if (transactions) transactions = transactions.map(blk => apiClient.transaction.decode(blk));
    const result = transactions || [transaction];
    return { data: result };
};

const getAccounts = async params => {
    const apiClient = await getApiClient();
    let account;
    let accounts;
    if (params.address) {
        account = await apiClient.account.get(params.address);
    } else if (params.addresses) {
        accounts = await apiClient._channel.invoke('app:getAccounts', { address: params.addresses });
    }
    if (accounts) accounts = accounts.map(acc => apiClient.account.decode(Buffer.from(acc, 'hex')));
    const result = accounts || [account];
    return { data: result };
};

const getForgers = async () => {
    const apiClient = await getApiClient();
    const forgers = await apiClient._channel.invoke('app:getForgers', {});
    return { data: forgers };
};

module.exports = {
    getNetworkStatus,
    getTransactions,
    getForgers,
    getAccounts,
};
