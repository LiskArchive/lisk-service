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

const getEvents = async (params) => {
	// try {
	//     const events = {
	//         data: {},
	//         meta: {},
	//     };

	//     const response = await dataService.getEvents(params);
	//     if (response.data) events.data = response.data;
	//     if (response.meta) events.meta = response.meta;

	//     return events;
	// } catch (error) {
	//     let status;
	//     if (err instanceof NotFoundException) status = NOT_FOUND;
	//     if (status) return { status, data: { error: err.message } };
	//     throw err;
	// }

	const events = {
		data: [
			{
				moduleID: '2',
				moduleName: 'token',
				typeID: '2',
				data: '0a14e135813f51103e7645ed87a0562a823d2fd48bc612207eef331c6d58f3962f5fb35b13f780f0ee7d93fbc37a3e9f4ccbdc6d1551db801a303629827aaa0836111137215708fd2007e9221ca1d56b29b98d8e9747ec3243c0549dc2091515d2bdd72fb28acef50160',
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

	return events;
};

module.exports = {
	getEvents,
};
