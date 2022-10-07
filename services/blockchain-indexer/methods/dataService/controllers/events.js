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
const {
	HTTP: { StatusCodes: { NOT_FOUND } },
	Exceptions: { NotFoundException },
} = require('lisk-service-framework');

const dataService = require('../../../shared/dataService');

const getEvents = async (params) => {
	const events = {
		data: {},
		meta: {},
	};

	try {
		const response = await dataService.getEvents(params);
		if (response.data) events.data = response.data;
		if (response.meta) events.meta = response.meta;

		return events;
	} catch (err) {
		let status;
		if (err instanceof NotFoundException) status = NOT_FOUND;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	getEvents,
};
