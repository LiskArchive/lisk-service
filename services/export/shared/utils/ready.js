/*
 * LiskHQ/lisk-service
 * Copyright © 2024 Lisk Foundation
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
const Moment = require('moment');
const MomentRange = require('moment-range');

const { Signals, Logger } = require('lisk-service-framework');

const config = require('../../config');

const { requestIndexer, getToday, getBlocks } = require('../helpers');

const moment = MomentRange.extendMoment(Moment);
const DATE_FORMAT = config.excel.dateFormat;

const logger = Logger();

let indexStatusCache;

const getIndexStatus = async () => {
	if (!indexStatusCache) {
		indexStatusCache = await requestIndexer('index.status');

		const updateIndexStatusListener = payload => {
			indexStatusCache = payload;
		};
		Signals.get('updateIndexStatus').add(updateIndexStatusListener);
	}
	return indexStatusCache;
};

const checkIfIndexReadyForInterval = async interval => {
	try {
		// Blockchain fully indexed
		const { data: indexStatus } = await getIndexStatus();
		if (indexStatus.percentageIndexed === 100) return true;

		// Requested history for only until yesterday and blockchain index can already serve the information
		const [, toDate] = interval.split(':');
		const to = moment(toDate, DATE_FORMAT);
		const today = moment(getToday(), DATE_FORMAT);
		if (to < today) {
			const response = await getBlocks({ height: indexStatus.lastIndexedBlockHeight });
			const [lastIndexedBlock] = response.data;
			const lastIndexedBlockGeneratedTime = lastIndexedBlock.timestamp;

			if (moment(lastIndexedBlockGeneratedTime * 1000) <= today) return true;
		}

		// Allow job scheduling if the last few blocks have not been indexed yet
		if (indexStatus.chainLength - indexStatus.numBlocksIndexed <= 5) {
			return true;
		}
	} catch (err) {
		logger.warn(`Index readiness check for export job scheduling failed due to: ${err.message}`);
		logger.debug(err.stack);
	}

	return false;
};

module.exports = {
	checkIfIndexReadyForInterval,
};
