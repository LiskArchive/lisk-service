/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const { getCCMs } = require('./controllers/crossChainMessages');

module.exports = [
	{
		name: 'ccm',
		controller: getCCMs,
		params: {
			id: { optional: true, type: 'string' },
			transactionID: { optional: true, type: 'string' },
			moduleCrossChainCommandID: { optional: true, type: 'string' },
			moduleCrossChainCommandName: { optional: true, type: 'string' },
			senderAddress: { optional: true, type: 'string' },
			nonce: { optional: true, type: 'string' },
			timestamp: { optional: true, type: 'string' },
			status: { optional: true, type: 'string' },
			limit: { optional: true, type: 'number' },
			offset: { optional: true, type: 'number' },
			sort: { optional: true, type: 'string' },
		},
	},
];
