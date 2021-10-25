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
} = require('lisk-service-framework');

const config = require('../config');

const mysqlIndex = require('./indexdb/mysql');
const newsfeedIndexSchema = require('./schema/newsfeed');

const getnewsfeedIndex = () => mysqlIndex('newsfeed', newsfeedIndexSchema);

const enabledSources = Object.values(config.sources)
	.filter(({ enabled }) => enabled)
	.map(({ name }) => name).join(',');

const getNewsfeedArticles = async params => {
	const { offset, limit, source = enabledSources } = params;
	const newsfeedDB = await getnewsfeedIndex();

	if (params.source) params = {
		...params,
		orWhereIn: { property: 'source', values: params.source.split(',') },
	};

	const data = await newsfeedDB.find(params, Object.keys(newsfeedIndexSchema.schema));

	// Send 'Service Unavailable' when no data is available
	if (!data.length) throw new ServiceUnavailableException('Service not available');

	return {
		data,
		meta: {
			count: data.length,
			limit,
			offset,
			source,
		},
	};
};

module.exports = { getNewsfeedArticles, getnewsfeedIndex };
