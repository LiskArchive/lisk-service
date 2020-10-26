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
const common = require('../common');
const coreV1Mappings = require('./coreV1Mappings');
const coreV3Mappings = require('./coreV3Mappings');

let coreVersion = '1.0.0-alpha.0';
let referenceKey = coreVersion;

const responseMappers = {
	'1.0.0-alpha.0': coreV1Mappings.responseMappers,
	'3.0.0-alpha.0': coreV3Mappings.responseMappers,
};

const mapResponse = (response, url) => {
	const mapper = responseMappers[referenceKey]
		&& responseMappers[referenceKey][url];
	if (mapper) {
		// TODO: remove the nested if condition and responseMapper entry when sdk_v3 is implemented
		if (referenceKey !== '1.0.0-alpha.0' || url === '/peers') response = mapper(response);
	}
	return response;
};

const paramMappers = {
	'1.0.0-alpha.0': coreV1Mappings.paramMappers,
	'3.0.0-alpha.0': coreV3Mappings.paramMappers,
};

const mapParams = (params, url) => {
	const mapper = paramMappers[referenceKey]
		&& paramMappers[referenceKey][url];
	if (mapper) {
		params = mapper(params);
	}
	return params;
};

const setCoreVersion = version => {
	coreVersion = version;
	common.setCoreVersion(coreVersion); // For smoother transition to new code

	const availableReferenceKeys = Object.keys(paramMappers);
	availableReferenceKeys.forEach(key => {
		if (semver.lte(key, coreVersion)) referenceKey = key;
	});
};

const getCoreVersion = () => coreVersion;

module.exports = {
	mapResponse,
	mapParams,
	setCoreVersion,
	getCoreVersion,
};
