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
const moment = require('moment');

const {
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const config = require('../../config');

const { getNetworkStatus, getBlocks } = require('./chain');

const DATE_FORMAT = config.excel.dateFormat;
const TIME_FORMAT = config.excel.timeFormat;

let defaultStartDate;

const getToday = () => moment().format(DATE_FORMAT);

const DAY_IN_MILLISECS = moment().endOf('day').valueOf() - moment().startOf('day').valueOf() + 1;
const getDaysInMilliseconds = days => days * DAY_IN_MILLISECS;

const momentFromTimestamp = timestamp => moment.unix(timestamp);

const dateFromTimestamp = timestamp => {
	const dateTime = momentFromTimestamp(timestamp);
	return dateTime.utcOffset(0).format(DATE_FORMAT);
};

const timeFromTimestamp = timestamp => {
	const dateTime = momentFromTimestamp(timestamp);
	return dateTime.utcOffset(0).format(TIME_FORMAT);
};

const getDefaultStartDate = async () => {
	if (!defaultStartDate) {
		const {
			data: { genesisHeight },
		} = await getNetworkStatus();
		const {
			data: [block],
		} = await getBlocks({ height: genesisHeight });
		defaultStartDate = moment(block.timestamp * 1000).format(DATE_FORMAT);
	}

	return defaultStartDate;
};

const standardizeIntervalFromParams = async ({ interval }) => {
	let from;
	let to;
	if (interval && interval.includes(':')) {
		[from, to] = interval.split(':');
		if (moment(to, DATE_FORMAT).diff(moment(from, DATE_FORMAT)) < 0) {
			throw new ValidationException(`Invalid interval supplied: ${interval}.`);
		}
	} else if (interval) {
		from = interval;
		to = getToday();
	} else {
		from = await getDefaultStartDate();
		to = getToday();
	}
	return `${from}:${to}`;
};

module.exports = {
	getToday,
	getDaysInMilliseconds,
	dateFromTimestamp,
	timeFromTimestamp,
	getDefaultStartDate,
	standardizeIntervalFromParams,
};
