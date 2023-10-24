/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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

let app;

const setAppContext = h => (app = h);

const getAppContext = () => app;

const requestRpc = async (service, method, params = {}) => {
	const data = await getAppContext().requestRpc(`${service}.${method}`, params);
	if (Utils.isObject(data) && data.error) throw new Error(data.error.message);
	return data;
};

const requestConnector = async (method, params) => requestRpc('connector', method, params);

const requestAppRegistry = async (method, params) => requestRpc('app-registry', method, params);

const requestFeeEstimator = async (method, params) => requestRpc('fees', method, params);

module.exports = {
	setAppContext,
	requestConnector,
	requestAppRegistry,
	requestFeeEstimator,
};
