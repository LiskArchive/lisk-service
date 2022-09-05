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

const getTransactionsStatistics = async (params) => {
	const dateFormat = params.interval === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM';

	const dateTo = moment()
		.utc()
		.endOf(params.interval)
		.subtract(params.offset, params.interval);
	const dateFrom = moment(dateTo)
		.startOf(params.interval)
		.subtract(params.limit - 1, params.interval);
	const statsParams = {
		dateFormat,
		dateTo,
		dateFrom,
	};

	const timelineRaw = await txStatisticsService.getStatsTimeline(statsParams);
	const timeline = timelineRaw.map((el) => ({
		...el,
		timestamp: Date.parse(el.date) / 1000,
		transactionCount: parseInt(el.transactionCount, 10),
	}));

	const distributionByModuleCommand = await txStatisticsService
		.getDistributionByModuleCommand(statsParams);
	const distributionByAmount = await txStatisticsService
		.getDistributionByAmount(statsParams);

	return {
		data: {
			timeline,
			distributionByModuleCommand,
			distributionByAmount,
		},
		meta: {
			limit: params.limit,
			offset: params.offset,
			dateFormat,
			dateFrom: dateFrom.format(dateFormat),
			dateTo: dateTo.format(dateFormat),
		},
	};
};

module.exports = {
	getTransactionsStatistics,
};
