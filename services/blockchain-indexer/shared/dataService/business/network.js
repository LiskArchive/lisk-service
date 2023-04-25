/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const { requestConnector } = require('../../utils/request');
const { getAvailableModuleCommands, getRegisteredModules } = require('../../constants');

const PEER_STATE = {
	CONNECTED: 'connected',
	DISCONNECTED: 'disconnected',
};

const getNetworkStatus = async () => {
	const status = await requestConnector('getNetworkStatus');

	status.moduleCommands = await getAvailableModuleCommands();
	status.registeredModules = await getRegisteredModules();
	status.constants = { chainID: status.chainID };

	return {
		data: status,
		meta: {
			lastUpdate: Math.floor(Date.now() / 1000),
			lastBlockHeight: status.height,
			lastBlockID: status.lastBlockID,
		},
	};
};

const getNetworkPeers = async params => {
	let peers;

	const state = params.state ? params.state.toString().toLowerCase() : undefined;

	if (state === 'connected') {
		peers = await requestConnector('getNetworkConnectedPeers');
	} else if (state === 'disconnected') {
		peers = await requestConnector('getNetworkDisconnectedPeers');
	} else {
		peers = await requestConnector('getNetworkPeers');
	}

	const intersect = (a, b) => {
		const setB = new Set(b);
		return [...new Set(a)].filter(x => setB.has(x));
	};

	const filterParams = ['ip', 'httpPort', 'wsPort', 'os', 'version', 'networkVersion', 'height', 'broadhash'];
	const activeParams = Object.keys(params).filter(item => params[item]);
	const activeFilters = intersect(filterParams, activeParams);

	const filteredPeers = peers.filter(peer => {
		let result = true;

		activeFilters.forEach(property => {
			if (params[property] !== peer[property]) result = false;
		});

		return result;
	});

	const sortBy = (array, p) => {
		const [property, direction] = p.split(':');
		if (property === 'version') array.sort((a, b) => a[property] > b[property]);
		if (property === 'height') array.sort((a, b) => Number(a[property]) < Number(b[property]));
		if (direction === 'asc') array.reverse();
		return array;
	};

	if (params.sort && /^.+:(asc|desc)$/.test(params.sort)) sortBy(filteredPeers, params.sort);

	let sortedPeers = filteredPeers;

	if (params.offset || params.limit) {
		if (!params.offset) params.offset = 0;
		sortedPeers = filteredPeers.slice(params.offset,
			(params.limit || filteredPeers.length) + params.offset);
	}

	const meta = {
		count: sortedPeers.length,
		offset: params.offset,
		total: peers.length,
	};

	return {
		data: sortedPeers,
		meta,
	};
};

const getNetworkConnectedPeers = async params => {
	const response = await getNetworkPeers(Object.assign(params, { state: PEER_STATE.CONNECTED }));
	return response;
};

const getNetworkDisconnectedPeers = async params => {
	const response = await getNetworkPeers(Object.assign(params, { state: PEER_STATE.DISCONNECTED }));
	return response;
};

const getNetworkPeersStatistics = async () => {
	const response = await requestConnector('getNetworkPeersStatistics');
	return {
		data: response,
		meta: {},
	};
};

module.exports = {
	getNetworkStatus,
	getNetworkPeers,
	getNetworkConnectedPeers,
	getNetworkDisconnectedPeers,
	getNetworkPeersStatistics,
};
