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

const { getTotalNumberOfDelegates } = require('../../services/delegateCache');
const CoreService = require('../../services/core.js');
const ObjectUtilService = require('../../services/object.js');
const { errorCodes: { NOT_FOUND } } = require('../../errorCodes.js');

const numOfActiveDelegates = CoreService.numOfActiveDelegates;

const isEmptyArray = ObjectUtilService.isEmptyArray;
const isEmptyObject = ObjectUtilService.isEmptyObject;

const getDelegates = async (params) => {
	if (params.anyId) params.address = await CoreService.getAddressByAny(params.anyId);
	const isFound = await CoreService.confirmAnyId(params);
	if (typeof params.anyId === 'string' && !params.address) return { status: NOT_FOUND, data: { error: `Delegate ${params.anyId} not found.` } };
	if (!isFound && params.address) return { status: NOT_FOUND, data: { error: `Delegate ${params.address} not found.` } };
	if (!isFound && params.username) return { status: NOT_FOUND, data: { error: `Delegate ${params.username} not found.` } };
	if (!isFound && params.publicKey) return { status: NOT_FOUND, data: { error: `Delegate with a public key ${params.publicKey} not found.` } };
	if (!isFound && params.secondPublicKey) return { status: NOT_FOUND, data: { error: `Delegate with a second public key ${params.secondPublicKey} not found.` } };

	delete params.anyId;

	const response = await CoreService.getDelegates(params);
	const delegates = response.data;
	const paramsArr = [
		'address',
		'publicKey',
		'secondPublicKey',
		'username',
		'search',
	];

	const reqParams = Object.keys(params);

	if (reqParams.some(e => paramsArr.includes(e))) {
		if (Array.isArray(delegates)) {
			response.meta.count = delegates.length;
			response.meta.total = getTotalNumberOfDelegates(params);
		}
	} else {
		response.meta.count = response.meta.limit;
		response.meta.total = getTotalNumberOfDelegates();
	}

	if (isEmptyObject(response) || isEmptyArray(response.data)) {
		return { status: NOT_FOUND, data: { error: 'Not found' } };
	}

	return {
		data: {
			data: delegates,
			meta: response.meta,
			link: response.link,
		},
	};
};

const getActiveDelegates = async (params) => {
	const response = await CoreService.getDelegates(Object.assign(params, {
		limit: params.limit || numOfActiveDelegates,
	}));
	const delegates = response.data.filter(delegate => delegate.rank <= numOfActiveDelegates);
	response.meta.count = delegates.length;
	response.meta.total = numOfActiveDelegates;


	return {
		data: {
			data: delegates,
			meta: response.meta,
			link: response.link,
		},
	};
};

const getStandbyDelegates = async (params) => {
	const response = await CoreService.getDelegates(Object.assign(params, {
		limit: params.limit,
		offset: parseInt(params.offset, 10) + numOfActiveDelegates || numOfActiveDelegates,
	}));
	const delegates = response.data;

	const totalStandbyDelegates = getTotalNumberOfDelegates() - numOfActiveDelegates;
	const offset = parseInt(params.offset, 10) - numOfActiveDelegates;

	response.meta.count = delegates.length;
	response.meta.offset = offset;
	response.meta.total = totalStandbyDelegates;

	return {
		data: {
			data: delegates,
			meta: response.meta,
			link: response.link,
		},
	};
};

const getNextForgers = async (params) => {
	const nextForgers = await CoreService.getNextForgers(params);
	const nextForgersData = nextForgers.data;

	const makeDelegatesArr = (forgers) => {
		const promises = forgers.map(async (forger) => {
			const delegates = await CoreService.getDelegates({
				address: forger.address,
			});
			return delegates.data[0];
		});
		return Promise.all(promises);
	};

	const delegates = await makeDelegatesArr(nextForgersData);
	nextForgers.meta.count = params.limit;
	nextForgers.meta.total = params.limit;

	return {
		data: {
			data: delegates,
			meta: nextForgers.meta,
			link: nextForgers.link,
		},
	};
};

const getLatestRegistrations = async (params) => {
	const registrationsRes = await CoreService.getTransactions(Object.assign(params, {
		type: 2,
		sort: 'timestamp:desc',
	}));
	const registrations = registrationsRes.data;
	const makeDelegatesArr = (regis) => {
		const promises = regis.map(async (registration) => {
			const delegates = await CoreService.getDelegates({
				address: registration.senderId,
			});
			return delegates.data[0];
		});
		return Promise.all(promises);
	};

	const delegates = await makeDelegatesArr(registrations);
	registrationsRes.meta.total = registrationsRes.meta.count;
	registrationsRes.meta.count = params.limit;

	return {
		data: {
			data: delegates,
			meta: registrationsRes.meta,
			link: registrationsRes.link,
		},
	};
};

module.exports = {
	getDelegates,
	getActiveDelegates,
	getStandbyDelegates,
	getNextForgers,
	getLatestRegistrations,
};
