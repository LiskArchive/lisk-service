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
const { Utils } = require('lisk-service-framework');

const ObjectUtilService = Utils.Data;
const { isProperObject } = ObjectUtilService;

const coreApiCached = require('../sdk_v2/coreApiCached');

const config = require('../../../../config.js');

const getConstants = async () => {
	const expireMiliseconds = Number(config.ttl.stable) * 1000;
	const result = await coreApiCached.getNetworkConstants(null, { expireMiliseconds });
	if (!isProperObject(result)) return {};
	return result.data;
};

module.exports = { getConstants };
