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
    getApiClient,
} = require('./wsRequest');

const {
    getNetworkConstants,
    setCoreVersion,
    getCoreVersion,
    getReadyStatus,
    setReadyStatus,
    getRegisteredModuleAssets,
    setRegisteredmoduleAssets,
    resolvemoduleAssets,
} = require('./constants');

const {
    getBlockchainTime,
    getEpochUnixTime,
    getUnixTime,
    validateTimestamp,
} = require('./time');

const {
    parseToJSONCompatObj,
} = require('./utils');

module.exports = {
    http,

    getApiClient,

    getNetworkConstants,
    setCoreVersion,
    getCoreVersion,
    getReadyStatus,
    setReadyStatus,
    getRegisteredModuleAssets,
    setRegisteredmoduleAssets,
    resolvemoduleAssets,

    getBlockchainTime,
    getEpochUnixTime,
    getUnixTime,
    validateTimestamp,

    parseToJSONCompatObj,
};
