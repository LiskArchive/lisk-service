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
const peerCache = require('./peerCache');
const GeoService = require('../geolocation');

const addLocation = async (ipaddress) => {
	try {
		const result = await GeoService.requestData(ipaddress);
		return result;
	} catch (e) {
		return {};
	}
};

const getPeers = async params => {
	let peers;

	const state = params.state ? params.state.toString().toLowerCase() : undefined;

	if (['connected', 'disconnected'].includes(state)) peers = await peerCache.get(state);
	else peers = await peerCache.get();

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

	const dataWithLocation = await Promise.all(sortedPeers.map(async (elem) => {
		elem.location = await addLocation(elem.ip);
		return elem;
	}));

	return dataWithLocation;
};

const getConnectedPeers = async params => getPeers(Object.assign(params, { state: 'connected' }));

const getDisconnectedPeers = async params => getPeers(Object.assign(params, { state: 'disconnected' }));

const getPeersStatistics = async () => peerCache.getStatistics();

module.exports = {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
};
