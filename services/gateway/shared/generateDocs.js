/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const {
	Utils,
} = require('lisk-service-framework');
const path = require('path');
const { requireAllJson } = require('./utils');
const config = require('../config');

const createApiDocs = (apiName, apiJsonPaths) => {
	const services = Utils.requireAllJs(path.resolve(__dirname, `../apis/${apiName}/methods`));
	const methods = Object.keys(services).reduce((acc, key) => {
		const method = services[key];
		return { ...acc, [key]: method.schema };
	}, {});

	if (methods.transactionBroadcast) methods.transactions['/transactions'].post = methods.transactionBroadcast['/transactions'].post;
	if (methods.transactionMultisigBroadcast) methods.transactionMultisig['/transactions/multisig'].post = methods.transactionMultisigBroadcast['/transactions/multisig'].post;
	if (methods.transactionMultisigPatch) methods.transactionMultisig['/transactions/multisig'].patch = methods.transactionMultisigPatch['/transactions/multisig'].patch;
	if (methods.transactionMultisigReject) methods.transactionMultisig['/transactions/multisig'].delete = methods.transactionMultisigReject['/transactions/multisig'].delete;

	const {
		transactionBroadcast,
		transactionMultisigBroadcast,
		transactionMultisigPatch,
		transactionMultisigReject,
		...remainingMethods
	} = methods;

	const apiSchemas = Object.keys(remainingMethods);
	apiSchemas.forEach((key) => {
		Object.assign(apiJsonPaths, remainingMethods[key]);
	});
	return apiJsonPaths;
};

const genDocs = ctx => {
	if (!config.api.versions[ctx.endpoint.baseUrl]) return {
		info: { description: `This route offers no specs for ${ctx.endpoint.baseUrl}` },
	};
	const httpVersion = config.api.versions[ctx.endpoint.baseUrl];
	const { apiJson, parameters, definitions, responses } = requireAllJson(httpVersion);
	return {
		...apiJson,
		parameters,
		definitions,
		responses,
		paths: createApiDocs(httpVersion, apiJson.paths),
	};
};

module.exports = {
	genDocs,
};
