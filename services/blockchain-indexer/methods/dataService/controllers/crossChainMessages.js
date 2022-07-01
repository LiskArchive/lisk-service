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
// const dataService = require('../../../shared/dataService');

const getCCMs = async params => {
	// const ccms = {
	// 	data: {},
	// 	meta: {},
	// };

	// const response = await dataService.getCCMs(params);
	// if (response.data) ccms.data = response.data;
	// if (response.meta) ccms.meta = response.meta;
	const ccms = {
		data: [
			{
				id: '6a0e4f33eb',
				moduleCrossChainCommandID: '64:3',
				moduleCrossChainCommandName: 'interoperability:mainchainCCUpdate',
				sendingChainID: 'sendingChainIdentifier',
				receivingChainID: 'receivingChainIdentifier',
				nonce: '0',
				fee: '1000000',
				status: 'ok',
				params: {
					amount: '150000000',
					recipient: {
						address: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
						publicKey: '2ca9a7...c23079',
						name: 'genesis_49',
					},
					data: 'message',
				},
				block: {
					id: '6258354802676165798',
					height: 8350681,
					timestamp: 28227090,
					transactionID: '12435autb1353anmbmab',
				},
				ccms: ['ccmID1', 'ccmID2'],
			},
		],
		meta: {
			count: 1,
			offset: params.offset,
			total: 100,
		},
		links: {},
	};

	return ccms;
};

module.exports = {
	getCCMs,
};
