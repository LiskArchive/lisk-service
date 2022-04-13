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
const Signals = require('./signals');
const { requestIndexer } = require('./utils/request');

module.exports = {
	appBlockNew: async (payload) => {
		const { block, accounts } = payload;

		await requestIndexer('newBlockEvent', { block });
		await requestIndexer('updateAccountsByAddress', { accounts });

		Signals.get('newBlock').dispatch(block);
	},
	appBlockDelete: async (payload) => {
		const { block, accounts } = payload;

		await requestIndexer('deleteBlockEvent', { block });
		await requestIndexer('updateAccountsByAddress', { accounts });
	},
	appChainValidatorsChange: async (payload) => {
		const { validators } = payload;
		await requestIndexer('newRoundEvent', { validators });
	},
};
