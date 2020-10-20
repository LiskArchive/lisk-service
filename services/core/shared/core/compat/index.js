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
const semver = require('semver');
const { getCoreVersion } = require('./common');

const sdkMappers = {
    '1.0.0-alpha.0': 'sdk_v2',
    '3.0.0-alpha.0': 'sdk_v3',
    '3.0.0-beta.1': 'sdk_v4',
    // '3.0.0-beta.1': sdk_v5,
};

let sdk;
Object.keys(sdkMappers).forEach(key => {
    if (semver.lte(key, getCoreVersion())) sdk = sdkMappers[key];
});

module.exports = {
    ...require('./common'),
    ...require(`./${sdk}`),
};
