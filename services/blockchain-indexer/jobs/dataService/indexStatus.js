/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const { Signals } = require('lisk-service-framework');

const { getLiveIndexingJobCount } = require('../../shared/indexer/blockchainIndex');

const reloadLiveIndexingJobCount = async () => {
	const count = await getLiveIndexingJobCount();
	Signals.get('numJobsInProgressUpdate').dispatch(count);
};

module.exports = [
	{
		name: 'reload.live.indexing.job.count',
		description: 'Update the current number of jobs for block indexing in progress/wait.',
		interval: 10, // Every 10 secs
		init: reloadLiveIndexingJobCount,
		controller: reloadLiveIndexingJobCount,
	},
];
