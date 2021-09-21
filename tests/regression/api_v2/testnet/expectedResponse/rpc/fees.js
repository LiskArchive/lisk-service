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
const fees = {
	jsonrpc: '2.0',
	result: {
		data: {
			feeEstimatePerByte: {
				low: 0,
				medium: 0,
				high: 0,
			},
			baseFeeById: {
				'5:0': '1000000000',
			},
			baseFeeByName: {
				'dpos:registerDelegate': '1000000000',
			},
			minFeePerByte: 1000,
		},
		meta: {
			lastUpdate: 1632231330,
			lastBlockHeight: 14631491,
			lastBlockId: 'a4f1c48a1fce980d76944e962550904f6cb421ea2e7ad75b2116ef40c08edfe8',
		},
	},
	id: 1,
};

module.exports = {
	fees,
};
