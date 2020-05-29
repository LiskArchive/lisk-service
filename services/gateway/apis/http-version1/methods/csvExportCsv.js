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
/* TODO: Replace the epochTimestamp with proper constants */
const epochTimestamp = (new Date(Date.UTC(2016, 4, 24, 17, 0, 0, 0))).getTime() / 1000;

const postgresTransaction = {
	'Transaction ID': 'id',
	'Sender ID': 'senderId',
	'Recipient ID': 'recipientId',
	'Block ID': 'blockId',
	Amount: 'amountLsk,string',
	Fee: 'feeLsk,string',
	Date: 'date,datetime',
	'Sender\'s Public Key': 'senderPublicKey,hex',
};

module.exports = {
	version: '2.0',
	swaggerApiPath: '/account/{account_id}/transactions/csv',
	envelope: {},
	filename: 'account_id',
	params: {
		account_id: { required: true },
	},
	source: [
		{
			type: 'postgres',
			endpoint: 'liskCorePostgres',
			query: `SELECT id, "blockId", "senderId", "recipientId", "senderPublicKey", 
							timestamp as "timestampBlockchain", to_timestamp(timestamp + ${epochTimestamp}) as "date",
							amount as "amountBeddows", (amount::decimal / (10 ^ 8)) as "amountLsk", 
							fee as "feeBeddows", (fee::decimal / (10 ^ 8)) as "feeLsk"
					FROM public.trs 
					WHERE "senderId" = \${senderId} OR "recipientId" = \${recipientId}`,
			params: {
				senderId: 'account_id',
				recipientId: 'account_id',
			},
			definition: { data: ['', postgresTransaction] },
		},
	],
	output: 'csv',
};
