/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { Logger, Utils } = require('lisk-service-framework');
const Bluebird = require('bluebird');

const CoreService = require('../../../shared/core');
const { getAccountKnowledge } = require('../../../shared/knownAccounts');
const { parseToJSONCompatObj } = require('../../../shared/jsonTools');

const ObjectUtilService = Utils.Data;
const { isEmptyObject } = ObjectUtilService;

const logger = Logger();

const getDataForAccounts = async params => {
	const accounts = {
		data: [],
		meta: {},
	};

	const response = params.isDelegate
		? await CoreService.getDelegates({ sort: 'rank:asc', ...params })
		: await CoreService.getAccounts({ sort: 'balance:desc', ...params });
	if (response.data) accounts.data = response.data;
	if (response.meta) accounts.meta = response.meta;

	const accountDataCopy = parseToJSONCompatObj(response.data);

	await Bluebird.map(
		accountDataCopy,
		async account => {
			try {
				account.multisignatureGroups = await CoreService.getMultisignatureGroups(account);
				account.incomingTxsCount = await CoreService.getIncomingTxsCount(account.address);
				account.outgoingTxsCount = await CoreService.getOutgoingTxsCount(account.address);
				account.multisignatureMemberships = await CoreService
					.getMultisignatureMemberships(account);
				account.knowledge = await getAccountKnowledge(account.address);
			} catch (err) {
				logger.warn(err.message);
			}
		},
		{ concurrency: 4 },
	);

	accounts.data = accountDataCopy;

	return accounts;
};

const getAccounts = async params => {
	const accounts = {
		data: [],
		meta: {},
	};

	const response = await getDataForAccounts(params);
	if (response.data) accounts.data = response.data;
	if (response.meta) accounts.meta = response.meta;

	return accounts;
};

const getTopAccounts = async params => {
	const accounts = {
		data: [],
		meta: {},
	};

	const response = await getDataForAccounts({ sort: 'balance:desc', ...params });
	if (response.data) accounts.data = response.data;
	if (response.meta) accounts.meta = response.meta;

	return accounts;
};

const getNextForgers = async params => {
	const nextForgers = await CoreService.getNextForgers(params);
	if (isEmptyObject(nextForgers)) return {};

	return {
		data: nextForgers.data,
		meta: nextForgers.meta,
	};
};

module.exports = {
	getAccounts,
	getTopAccounts,
	getNextForgers,
};
