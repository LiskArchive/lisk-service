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
const Bluebird = require('bluebird');

const { StatusCodes: { NOT_FOUND } } = HTTP;
const { isEmptyArray } = Utils.Data;

const CoreService = require('../../../shared/core');
const { getAccountKnowledge } = require('../../../shared/core/knownAccounts');
const { parseToJSONCompatObj } = require('../../../shared/jsonTools');

const logger = Logger();

const getDataForAccounts = async params => {
	const accounts = params.isDelegate
		? await CoreService.getDelegates({ sort: 'rank:asc', ...params })
		: await CoreService.getAccounts({ limit: 10, offset: 0, sort: 'balance:desc', ...params });

	const response = {
		data: [],
		meta: {},
		links: {},
	};

	const accountDataCopy = parseToJSONCompatObj(accounts.data);

	if (!accounts.data || isEmptyArray(accounts.data)) {
		response.meta.count = 0;
		response.meta.total = 0;
	} else {
		await Bluebird.map(accountDataCopy, async account => {
			try {
				account.multisignatureGroups = await CoreService.getMultisignatureGroups(account);
				account.incomingTxsCount = await CoreService.getIncomingTxsCount(account.address);
				account.outgoingTxsCount = await CoreService.getOutgoingTxsCount(account.address);
				account.multisignatureMemberships = await CoreService.getMultisignatureMemberships(
					account);
				account.knowledge = await getAccountKnowledge(account.address);
			} catch (err) {
				logger.warn(err.message);
			}
		}, { concurrency: 4 });

		response.data = accountDataCopy;
		response.meta.count = accountDataCopy.length;
		response.meta.total = accounts.meta.total;
		response.meta.offset = parseInt(params.offset, 10);
	}

	return response;
};

const getAccounts = async params => {
	const isFound = await CoreService.confirmAnyId(params);
	if (typeof params.anyId === 'string' && !params.address) return { status: NOT_FOUND, data: { error: `Account ${params.anyId} not found.` } };
	if (!isFound && params.address) return { status: NOT_FOUND, data: { error: `Account ${params.address} not found.` } };
	if (!isFound && params.username) return { status: NOT_FOUND, data: { error: `Account ${params.username} not found.` } };
	if (!isFound && params.publicKey) return { status: NOT_FOUND, data: { error: `Account with a public key ${params.publicKey} not found.` } };
	if (!isFound && params.secondPublicKey) return { status: NOT_FOUND, data: { error: `Account with a second public key ${params.secondPublicKey} not found.` } };

	try {
		const response = await getDataForAccounts(params);

		return {
			data: response.data,
			meta: response.meta,
		};
	} catch (err) {
		logger.error(err.stack);
		return {
			data: [],
			meta: {},
		};
	}
};

const getTopAccounts = async params => {
	const response = await getDataForAccounts(Object.assign(params, {
		sort: 'balance:desc',
		limit: params.limit,
		offset: params.offset,
	}));

	return {
		data: response.data,
		meta: response.meta,
		links: response.links,
	};
};

module.exports = {
	getAccounts,
	getTopAccounts,
};
