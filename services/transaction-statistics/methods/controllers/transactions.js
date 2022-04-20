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
const moment = require('moment');

const txStatisticsService = require('../../shared/transactionStatistics');

const getTransactionsStatistics = async ({
	aggregateBy,
	limit = 10,
	offset = 0,
}) => {
	limit = parseInt(limit, 10);
	offset = parseInt(offset, 10);
	const dateFormat = aggregateBy === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM';

	const dateTo = moment()
		.utc()
		.endOf(aggregateBy)
		.subtract(offset, aggregateBy);
	const dateFrom = moment(dateTo)
		.startOf(aggregateBy)
		.subtract(limit - 1, aggregateBy);
	const params = {
		dateFormat,
		dateTo,
		dateFrom,
	};

	const timelineRaw = await txStatisticsService.getStatsTimeline(params);
	const timeline = timelineRaw.map((el) => ({
		...el,
		timestamp: Date.parse(el.date) / 1000,
		transactionCount: parseInt(el.transactionCount, 10),
	}));

	const distributionByType = await txStatisticsService.getDistributionByType(params);
	const distributionByAmount = await txStatisticsService.getDistributionByAmount(params);

	return {
		data: {
			timeline,
			distributionByType,
			distributionByAmount,
		},
		meta: {
			limit,
			offset,
			dateFormat,
			dateFrom: dateFrom.format(dateFormat),
			dateTo: dateTo.format(dateFormat),
		},
	};
};

const getTransactionsStatisticsDay = (params) => getTransactionsStatistics({ aggregateBy: 'day', ...params });
const getTransactionsStatisticsMonth = (params) => getTransactionsStatistics({ aggregateBy: 'month', ...params });

module.exports = {
	getTransactionsStatisticsDay,
	getTransactionsStatisticsMonth,
};
