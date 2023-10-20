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
const logger = require('lisk-service-framework').Logger();
const FileStorage = require('../shared/csvCache');

const config = require('../config');

const partials = FileStorage(config.cache.partials);
const staticFiles = FileStorage(config.cache.exports);

module.exports = [
	{
		name: 'job.purge.cache',
		description: 'Cache maintenance',
		interval: config.job.purgeCache.interval,
		schedule: config.job.purgeCache.schedule,
		controller: () => {
			logger.info('Performing cache maintenance');
			partials.purge();
			staticFiles.purge();
		},
	},
];
