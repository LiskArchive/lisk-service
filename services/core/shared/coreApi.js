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
const { HTTP, Logger } = require('lisk-service-framework');

const logger = Logger('CustomAPI');
const requestLib = HTTP.request;

const { mapResponse, mapParams } = require('./coreVersionCompatibility.js');
const config = require('../config.js');

const liskAddress = config.endpoints.liskHttp;

// HTTP request stack
const validateCoreResponse = body => {
	try {
		if (typeof body === 'object') {
			return true;
		}
		return false;
	} catch (err) {
		return false;
	}
};

const request = (url, params) => new Promise((resolve, reject) => {
	logger.info(`Requesting ${liskAddress}${url}`);
	requestLib(`${liskAddress}${url}`, {
		params: mapParams(params, url),
		timeout: (config.httpTimeout || 15) * 1000, // ms
	}).then(body => {
		if (!body) resolve({});

		let jsonContent;
		try {
			if (typeof body === 'string') jsonContent = JSON.parse(body);
			else jsonContent = body.data;
		} catch (err) {
			logger.error(err.stack);
			return reject(err);
		}

		if (validateCoreResponse(jsonContent)) {
			return resolve(mapResponse(jsonContent, url));
		}
		return reject(body.error || 'Response was unsuccessful');
	}).catch(err => {
		logger.error(err.stack);
		resolve({});
	});
});

const getAccounts = params => request('/accounts', params);
const getBlocks = params => request('/blocks', params);
const getDelegates = params => request('/delegates', params);
const getForgingStats = address => request(`/delegates/${address}/forging_statistics`);
const getMultisignatureGroups = address => request(`/accounts/${address}/multisignature_groups`);
const getMultisignatureMemberships = address => request(`/accounts/${address}/multisignature_memberships`);
const getNetworkConstants = () => request('/node/constants');
const getNetworkStatus = () => request('/node/status');
const getNextForgers = params => request('/delegates/forgers', params);
const getPeers = params => request('/peers', params);
const getTransactions = params => request('/transactions', params);
const getVoters = params => request('/voters', params);
const getVotes = params => request('/votes', params);

module.exports = {
	request,
	getAccounts,
	getBlocks,
	getDelegates,
	getForgingStats,
	getMultisignatureGroups,
	getMultisignatureMemberships,
	getNetworkConstants,
	getNetworkStatus,
	getNextForgers,
	getPeers,
	getTransactions,
	getVoters,
	getVotes,
};
