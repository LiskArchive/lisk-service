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
const coreVersion300 = require('./coreVersion_3_0_0');

let coreVersion = '2.1.6';
let coreMinVersion = '2.0.0';

const responseMappers = {
	'3.0.0': coreVersion300.responseMappers,
};

const mapResponse = (response, url) => {
	const mapper = responseMappers[coreMinVersion]
		&& responseMappers[coreMinVersion][url];
	if (mapper) {
		response = mapper(response);
	}
	return response;
};

const paramMappers = {
	'2.0.0': coreVersion300.paramMappersCoreV2,
	'3.0.0': coreVersion300.paramMappersCoreV3,
};

const mapParams = (params, url) => {
	const mapper = paramMappers[coreMinVersion]
		&& paramMappers[coreMinVersion][url];
	if (mapper) {
		params = mapper(params);
	}
	return params;
};

const setCoreVersion = version => {
	// Store '3.0.0-beta.0' as '3.0.0' for internal reference
	coreMinVersion = semver.coerce(version).version.charAt(0).concat('.0.0');
	coreVersion = version;
};

const getCoreVersion = () => coreVersion;

module.exports = {
	mapResponse,
	mapParams,
	setCoreVersion,
	getCoreVersion,
};
