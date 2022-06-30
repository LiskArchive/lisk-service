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
const getEvents = async (params) => {
	// TODO: Replace with real implementation with the issue https://github.com/liskhq/lisk-service/issues/1122
	const response = {
		data: [
			{
				moduleID: '2',
				moduleName: 'token',
				typeID: '2',
				data: {
					amount: '150000000',
					recipientAddress: 'lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu',
					data: 'message',
				},
				topics: [],
				block: {
					id: '6258354802676165798',
					height: 8350681,
					timestamp: 28227090,
				},
			},
		],
		meta: {
			count: 1,
			offset: params.offset,
			total: 100,
		},
		links: {},
	};

	return response;
};

module.exports = {
	getEvents,
};