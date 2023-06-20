/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
module.exports = {
	type: 'moleculer',
	method: 'indexer.transactions.estimate-fees',
	params: {
		transaction: '=',
	},
	definition: {
		data: {
			transaction: {
				fee: {
					tokenID: '=,string',
					minimum: '=,string',
					priority: {
						low: '=,string',
						medium: '=,string',
						high: '=,string',
					},
				},
				params: {
					messageFee: {
						tokenID: '=,string',
						amount: '=,string',
					},
				},
			},
		},
		meta: {
			feeBreakdown: {
				minimum: {
					byteFee: '=,string',
					additionalFees: {
						registrationFee: '=,string',
						accountInitializationFee: '=,string',
					},
				},
			},
		},
	},
};
