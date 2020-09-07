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

const coreProtocol20 = require('./coreProtocol_2_0');

let protocolVersion = '1.1';

const responseMappers = {
	'2.0': coreProtocol20.responseMappers,
};

const mapResponse = (response, url) => {
	const mapper = responseMappers[protocolVersion]
    && responseMappers[protocolVersion][url];
	if (mapper) {
		response = mapper(response);
	}
	return response;
};

const paramMappers = {
	'1.1': coreProtocol20.paramMappers11,
	'2.0': coreProtocol20.paramMappers20,
};

const mapParams = (params, url) => {
	const mapper = paramMappers[protocolVersion]
    && paramMappers[protocolVersion][url];
	if (mapper) {
		params = mapper(params);
	}
	return params;
};

const setProtocolVersion = version => {
	protocolVersion = version;
};

const getProtocolVersion = () => protocolVersion;

module.exports = {
	mapResponse,
	mapParams,
	setProtocolVersion,
	getProtocolVersion,
};
