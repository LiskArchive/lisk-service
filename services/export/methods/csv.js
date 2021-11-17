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
const { requestRpc } = require('../shared/rpcBroker');

const getTransactions = (address) => requestRpc('core.transactions', { senderIdOrRecipientId: address });

const getCsvFromJson = (json) => {
	const fields = Object.keys(json[0]).map(k => ({ label: k, value: k }));
	const opts = { fields };
	const parser = new Parser(opts);
	return parser.parse(json);
};

module.exports = [
	{
		name: 'csv',
		description: 'Exports CSV',
		params: {
			address: { type: 'string', optional: false },
		},
		controller: async param => {
			const transactions = await getTransactions(param.address);

			return getCsvFromJson(transactions.data);
		},
	},
];
