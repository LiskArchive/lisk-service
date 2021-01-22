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
const { HTTP, Utils } = require('lisk-service-framework');

const { StatusCodes: { NOT_FOUND } } = HTTP;
const ObjectUtilService = Utils.Data;

const CoreService = require('../../shared/core');

const { numOfActiveDelegates, getTotalNumberOfDelegates } = CoreService;

const { isEmptyArray } = ObjectUtilService;
const { isEmptyObject } = ObjectUtilService;

const getDelegates = async params => {
	const isFound = await CoreService.confirmAnyId(params);
	if (typeof params.anyId === 'string' && !params.address) return { status: NOT_FOUND, data: { error: `Delegate ${params.anyId} not found.` } };
	if (!isFound && params.address) return { status: NOT_FOUND, data: { error: `Delegate ${params.address} not found.` } };
	if (!isFound && params.username) return { status: NOT_FOUND, data: { error: `Delegate ${params.username} not found.` } };
	if (!isFound && params.publicKey) return { status: NOT_FOUND, data: { error: `Delegate with a public key ${params.publicKey} not found.` } };
	if (!isFound && params.secondPublicKey) return { status: NOT_FOUND, data: { error: `Delegate with a second public key ${params.secondPublicKey} not found.` } };

	const response = await CoreService.getDelegates(params);

	if (isEmptyObject(response) || isEmptyArray(response.data)) return { status: NOT_FOUND, data: { error: 'Not found' } };

	return {
		data: response.data,
		meta: response.meta,
	};
};

const getActiveDelegates = async params => {
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
		},
	};
};

const getStandbyDelegates = async params => {
	const response = await CoreService.getDelegates(Object.assign(params, {
		limit: params.limit,
		offset: parseInt(params.offset, 10) + numOfActiveDelegates || numOfActiveDelegates,
	}));
	const delegates = response.data;

	const totalStandbyDelegates = (await getTotalNumberOfDelegates()) - numOfActiveDelegates;
	const offset = parseInt(params.offset, 10) - numOfActiveDelegates;

	response.meta.count = delegates.length;
	response.meta.offset = offset;
	response.meta.total = totalStandbyDelegates;

	return {
		data: {
			data: delegates,
			meta: response.meta,
		},
	};
};

const getNextForgers = async params => {
	const nextForgers = await CoreService.getNextForgers(params);
	if (isEmptyObject(nextForgers)) return {};

	return {
		data: nextForgers.data,
		meta: nextForgers.meta,
	};
};

const getLatestRegistrations = async params => {
	const registrationsRes = await CoreService.getTransactions(Object.assign(params, {
		type: 'REGISTERDELEGATE',
		// sort: 'timestamp:desc',
	}));

	const registrations = registrationsRes.data;
	const makeDelegatesArr = regis => {
		const promises = regis.map(async registration => {
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
		data: delegates,
		meta: registrationsRes.meta,
	};
};

module.exports = {
	getDelegates,
	getActiveDelegates,
	getStandbyDelegates,
	getNextForgers,
	getLatestRegistrations,
};
