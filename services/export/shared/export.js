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
const {
    requestRpc,
} = require('./rpcBroker');

const {
    dateFromTimestamp,
    timeFromTimestamp,
} = require('./helpers/time');

const {
    parseJsonToCsv,
} = require('./helpers/csvUtils');

const fields = require('./csvFieldMappings');

const getTransactions = (address) => requestRpc('core.transactions', { senderIdOrRecipientId: address });

const parseTransactionsToCsv = (json) => {
    const opts = { fields };
    return parseJsonToCsv(opts, json);
};

const normalizeTransaction = (tx) => {
    const date = dateFromTimestamp(tx.unixTimestamp);
    const time = timeFromTimestamp(tx.unixTimestamp);
    const amount = tx.asset.amount || null;
    const fee = tx.fee;
    const moduleAssetId = tx.moduleAssetId;
    const moduleAssetName = tx.moduleAssetName;
    const sender = tx.senderId;
    const recipient = tx.asset.recipient && tx.asset.recipient.address || null;
    const senderPublicKey = tx.senderPublicKey;
    const recipientPublicKey = tx.asset.recipient && tx.asset.recipient.publicKey || null;
    const blockHeight = tx.height;
    const note = tx.asset.data || null;
    const transactionId = tx.id;

    return {
        date, time, amount, fee, moduleAssetId,
        moduleAssetName, sender, recipient,
        senderPublicKey, recipientPublicKey,
        blockHeight, note, transactionId,
    };
};

const exportTransactionsCSV = async (params) => {
    const response = await getTransactions(params.address);
    const csv = parseTransactionsToCsv(response.data.map(t => normalizeTransaction(t)));
    return csv;
};

module.exports = {
    exportTransactionsCSV,
};
