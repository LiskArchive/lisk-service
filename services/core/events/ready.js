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

const core = require('../shared/core');
const signals = require('../shared/signals');

module.exports = [
    {
        name: 'status.core',
        description: 'Check status for core:',
        controller: async callback => {
            signals.get('newBlock').add(async () => {
                logger.debug('Check current status of core');
                const coreStatus = await core.getCurrentStatus();
                callback(coreStatus);
            });
        },
    },
];
