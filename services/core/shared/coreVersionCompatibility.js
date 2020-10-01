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
const coreVersion300 = require('./coreVersion_3_0_0');

let coreVersion = '2.1.6';

const responseMappers = {
	'3.0.0-beta.0': coreVersion300.responseMappers,
};

const mapResponse = (response, url) => {
	const mapper = responseMappers[coreVersion]
		&& responseMappers[coreVersion][url];
	if (mapper) {
		response = mapper(response);
	}
	return response;
};

const paramMappers = {
	'3.0.0-beta.0': coreVersion300.paramMappers300,
};

const mapParams = (params, url) => {
	const mapper = paramMappers[coreVersion]
		&& paramMappers[coreVersion][url];
	if (mapper) {
		params = mapper(params);
	}
	return params;
};

const setCoreVersion = version => {
	coreVersion = version;
};

const getCoreVersion = () => coreVersion;

module.exports = {
	mapResponse,
	mapParams,
	setCoreVersion,
	getCoreVersion,
};
