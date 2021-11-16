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
const { Parser } = require('json2csv');

const { requestRpc } = require('./rpcBroker');

const getTransactions = (address) => requestRpc('core.transactions', { senderIdOrRecipientId: address });

const getCsvFromJson = (json) => {
	const fields = Object.keys(json[0]).map(k => ({ label: k, value: k }));
	const opts = { fields };
	const parser = new Parser(opts);
	return parser.parse(json);
};

const normalizeTransaction = (transaction) => transaction;

const exportTransactionsCSV = async (params) => {
	const response = await getTransactions(params.address);
	const csv = getCsvFromJson(response.data.map(t => normalizeTransaction(t)));
	return csv;
};

module.exports = {
	exportTransactionsCSV,
};
