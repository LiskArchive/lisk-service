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
		lastUpdate: 1632141101,
		lastBlockHeight: 14623584,
		lastBlockId: '3ffd66092280c21c860cd781018adbfad9fd0631c07b5b77a59ef9018f2df216',
	},
};

module.exports = {
	fees,
};
