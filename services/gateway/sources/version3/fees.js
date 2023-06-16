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
module.exports = {
	type: 'moleculer',
	method: 'fees.estimates',
	params: {},
	definition: {
		data: {
			feeEstimatePerByte: {
				low: '=,number',
				medium: 'med,number',
				high: '=,number',
			},
			minFeePerByte: '=,number',
			feeTokenID: '=,string',
		},
		meta: {
			lastUpdate: 'updated,number',
			lastBlockHeight: 'blockHeight,number',
			lastBlockID: 'blockID,string',
		},
	},
};
