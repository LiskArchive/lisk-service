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
const http = require('../common/httpRequest');
// TODO: Enable when sdk_v3 is fully implemented
// const { mapParams, mapResponse } = require('./mappings');
const { mapParams, mapResponse } = require('./coreVersionCompatibility');

const request = async (url, params) => {
	const transformedParams = mapParams(params, url);
	const response = await http.get(url, transformedParams);
	const transformedResponse = mapResponse(response, url);

	return transformedResponse;
};

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
