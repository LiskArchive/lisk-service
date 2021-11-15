/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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

module.exports = [
	{
		name: 'job.1',
		description: 'Generic job template',
		schedule: '* * * * *', // Every 1 min
		controller: () => {
			const operationResult = (() => ([1, 2, 3, 4, 5]))();
			logger.info(`Dummy job is done, processed ${operationResult.length} items`);
		},
	},
];
