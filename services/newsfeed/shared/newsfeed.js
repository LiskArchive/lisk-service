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
const {
	Exceptions: { ServiceUnavailableException },
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../config');

const newsfeedIndexSchema = require('./schema/newsfeed');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getNewsFeedIndex = () => getTableInstance('newsfeed', newsfeedIndexSchema, MYSQL_ENDPOINT);

const getNewsfeedArticles = async params => {
	const { offset } = params;
	const newsfeedDB = await getNewsFeedIndex();

	if (params.source) params = {
		...params,
		orWhereIn: { property: 'source', values: params.source.split(',') },
	};

	const data = await newsfeedDB.find(
		{ sort: 'created_at:desc', ...params },
		Object.keys(newsfeedIndexSchema.schema),
	);

	// Send 'Service Unavailable' when no data is available
	if (!data.length) throw new ServiceUnavailableException('Service not available');

	const total = await newsfeedDB.count(params);

	return {
		data,
		meta: {
			count: data.length,
			offset,
			total,
		},
	};
};

module.exports = { getNewsfeedArticles, getNewsFeedIndex };
