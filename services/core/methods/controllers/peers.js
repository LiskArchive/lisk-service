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
const { HTTP, Utils, Logger } = require('lisk-service-framework');

const { StatusCodes: { NOT_FOUND } } = HTTP;
const ObjectUtilService = Utils.Data;

const CoreService = require('../../shared/core.js');
const GeoService = require('../../shared/geolocation.js');

const { peerStates } = CoreService;
const { isEmptyArray } = ObjectUtilService;
const { isEmptyObject } = ObjectUtilService;

const logger = Logger();

/* TODO: Move request all to HTTP library */
const requestAll = async (fn, params, limit) => {
	const defaultMaxAmount = limit || 10000;
	const oneRequestLimit = params.limit || 100;
	const firstRequest = await fn({ ...params,
limit: oneRequestLimit,
		offset: 0 });
	const { data } = firstRequest;
	const maxAmount = firstRequest.meta.count > defaultMaxAmount
		? defaultMaxAmount
		: firstRequest.meta.count;

	if (maxAmount > oneRequestLimit) {
		const pages = [...Array(Math.ceil(maxAmount / oneRequestLimit)).keys()];
		pages.shift();

		const collection = await pages.reduce((promise, page) => promise.then(() => fn(
			{ ...params,
limit: oneRequestLimit,
				offset: oneRequestLimit * page })).then(result => {
			result.data.forEach(item => { data.push(item); });
			return data;
		}).catch(err => {
			logger.warn(`Failed to fetch data ${err}`);
		}), Promise.resolve());
		return collection;
	}
	return data;
};

// const requestAll = async (fn, params, limit) => (await fn(params)).data;

const addLocation = async ipaddress => {
	try {
		const result = await GeoService.requestData(ipaddress);
		return result;
	} catch (e) {
		return {};
	}
};

const getPeers = async params => {
	const res = await CoreService.getPeers(params);
	const { data } = res;

	if (isEmptyObject(res) || isEmptyArray(data)) {
		return { status: NOT_FOUND, data: { error: 'Not found' } };
	}

	const dataWithLocation = await Promise.all(data.map(async elem => {
		elem.location = await addLocation(elem.ip);
		return elem;
	}));

	const meta = {
		count: res.data.length,
		limit: res.meta.limit,
		offset: res.meta.offset,
		total: res.meta.count,
	};

	return {
		data: dataWithLocation,
		meta,
		links: {},
	};
};

const getConnectedPeers = async () => {
	const peers = await requestAll(CoreService.getPeers, { state: peerStates.CONNECTED });

	// TODO: Fix geolocation
	// const dataWithLocation = await Promise.all(peers.map(async (elem) => {
	// 	elem.location = await addLocation(elem.ip);
	// 	return elem;
	// })).catch((err) => logger.warn(err));

	const dataWithLocation = () => peers;

	const meta = {
		count: peers.length,
		offset: 0,
		total: peers.length,
	};

	return {
		data: dataWithLocation,
		meta,
		links: {},
	};
};

const getDisconnectedPeers = async () => {
	const peers = await requestAll(CoreService.getPeers, { state: peerStates.DISCONNECTED });

	const dataWithLocation = await Promise.all(peers.map(async elem => {
		elem.location = await addLocation(elem.ip);
		return elem;
	}));

	const meta = {
		count: peers.length,
		offset: 0,
		total: peers.length,
	};

	return {
		data: dataWithLocation,
		meta,
		links: {},
	};
};

const getPeersStatistics = async params => {
	const basicStats = {};
	const heightStats = {};
	const coreVerStats = {};
	const osStats = {};

	const peers = await CoreService.getPeers(params);
	const connected = await requestAll(CoreService.getPeers, { state: peerStates.CONNECTED });
	const disconnected = await requestAll(CoreService.getPeers, { state: peerStates.DISCONNECTED });

	basicStats.totalPeers = peers.meta.count;
	basicStats.connectedPeers = connected.length;
	basicStats.disconnectedPeers = disconnected.length;

	const heightArr = connected.map(elem => elem.height);
	heightArr.forEach(elem => heightStats[elem] = (heightStats[elem] || 0) + 1);

	const coreVerArr = connected.map(elem => elem.version);
	coreVerArr.forEach(elem => coreVerStats[elem] = (coreVerStats[elem] || 0) + 1);

	const osArr = connected.map(elem => elem.os);
	const mappedOs = osArr.map(elem => {
		if (elem.match(/^linux(.*)/)) {
			const splitOsString = elem.split('.');
			elem = `${splitOsString[0]}.${splitOsString[1]}`;
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
		links: {},
	};
};

module.exports = {
	getPeers,
	getConnectedPeers,
	getDisconnectedPeers,
	getPeersStatistics,
};
