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
const config = require('../config');
const { updateSvcStatus } = require('../shared/ready');

module.exports = [
	{
		name: 'update.readiness.status',
		description: 'Keep the readiness status up-to-date',
		interval: config.job.updateReadinessStatus.interval,
		schedule: config.job.updateReadinessStatus.schedule,
		init: updateSvcStatus,
		controller: updateSvcStatus,
	},
];
