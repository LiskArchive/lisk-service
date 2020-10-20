/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const http = require('./httpRequest');

const {
    getConstants,
    setCoreVersion,
    getCoreVersion,
} = require('./constants');

const {
    getBlockchainTime,
    getEpochUnixTime,
    getUnixTime,
    validateTimestamp,
} = require('./time');

module.exports = {
    http,

    getConstants,
    setCoreVersion,
    getCoreVersion,

    getBlockchainTime,
    getEpochUnixTime,
    getUnixTime,
    validateTimestamp,
};
