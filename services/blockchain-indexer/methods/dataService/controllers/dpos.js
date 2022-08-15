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
// const {
// 	Utils: { Data: { isEmptyObject } },
// 	HTTP: { StatusCodes: { BAD_REQUEST } },
// 	Exceptions: { ValidationException, InvalidParamsException },
// } = require('lisk-service-framework');

// const dataService = require('../../../shared/dataService');

const getDelegates = async params => {
	// const delegates = {
	// 	data: [],
	// 	meta: {},
	// };

	// try {
	// 	const response = await dataService.getDelegates(params);
	// 	if (isEmptyObject(response)) return {};

	// 	if (response.data) delegates.data = response.data;
	// 	if (response.meta) delegates.meta = response.meta;

	// 	return delegates;
	// } catch (err) {
	// 	let status;
	// 	if (err instanceof InvalidParamsException) status = 'INVALID_PARAMS';
	// 	if (err instanceof ValidationException) status = BAD_REQUEST;
	// 	if (status) return { status, data: { error: err.message } };
	// 	throw err;
	// }

	const delegates = {
		data: [
			{
				name: 'gr33ndrag0n',
				totalVotesReceived: '1006000000000',
				selfVotes: '100600000000',
				voteWeight: '1006000000000',
				address: 'lskaq5cbv3tjy3wf9789v834ndjpvn94vj7bpawsc',
				lastGeneratedHeight: 27605,
				status: 'active',
				isBanned: true,
				pomHeights: [{
					start: 123,
					end: 567,
				}],
				consecutiveMissedBlocks: 0,
			},
		],
		meta: {
			count: 10,
			offset: params.offset,
			total: 1023,
		},
	};

	return delegates;
};

module.exports = {
	getDelegates,
};

