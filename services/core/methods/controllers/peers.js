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
const GeoService = require('../../shared/geolocation.js');
const peerCache = require('../../shared/peerCache.js');

const addLocation = async (ipaddress) => {
	try {
		const result = await GeoService.requestData(ipaddress);
		return result;
	} catch (e) {
		return {};
	}
};

const getPeers = async (params) => {
	let peers = {};

	const state = params.state ? params.state.toString().toLowerCase() : undefined;

	if (state === '2' || state === 'connected') peers = await peerCache.get('connected');
	else if (state === '1' || state === 'disconnected') peers = await peerCache.get('disconnected');
	else if (state === '0' || state === 'unknown') peers = []; // not supported anymore
	else peers = await peerCache.get();

	const intersect = (a, b) => {
		const setB = new Set(b);
		return [...new Set(a)].filter(x => setB.has(x));
	};

	const filterParams = ['ip', 'httpPort', 'wsPort', 'os', 'version', 'height', 'broadhash'];
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

	const meta = {
		count: dataWithLocation.length,
		offset: params.offset || 0,
		total: peers.length,
	};

	return {
		data: dataWithLocation,
		meta,
	};
};

const getConnectedPeers = async params => {
	const response = await getPeers(Object.assign(params, { state: 'connected' }));

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getDisconnectedPeers = async params => {
	const response = await getPeers(Object.assign(params, { state: 'disconnected' }));

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getPeersStatistics = async () => {
	const basicStats = {};
	const heightStats = {};
	const coreVerStats = {};
	const osStats = {};

	const peers = await peerCache.get();
	const connected = await peerCache.get('connected');
	const disconnected = await peerCache.get('disconnected');

	basicStats.totalPeers = peers.length;
	basicStats.connectedPeers = connected.length;
	basicStats.disconnectedPeers = disconnected.length;

	const heightArr = connected.map(elem => elem.height);
	heightArr.forEach(elem => heightStats[elem] = (heightStats[elem] || 0) + 1);

	const coreVerArr = connected.map(elem => elem.version);
	coreVerArr.forEach(elem => coreVerStats[elem] = (coreVerStats[elem] || 0) + 1);

	const osArr = connected.map(elem => elem.os);
	const mappedOs = osArr.map((elem) => {
		if (elem.match(/^linux(.*)/)) {
			const splitOsString = elem.split('.');
			elem = `${splitOsString[0]}.${splitOsString[1].split('-')[0]}`;
		}
		return elem;
	});
	mappedOs.forEach(elem => osStats[elem] = (osStats[elem] || 0) + 1);

	return {
		data: {
			basic: basicStats,
			height: heightStats,
			coreVer: coreVerStats,
			os: osStats,
		},
		meta: {},
	};
};

module.exports = {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
};
