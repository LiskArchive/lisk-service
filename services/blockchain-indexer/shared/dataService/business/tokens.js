/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const BluebirdPromise = require('bluebird');

const {
	MySQL: { getTableInstance },
	Exceptions: { InvalidParamsException },
} = require('lisk-service-framework');

const topAccountsIndexSchema = require('../../database/schema/topLSKAccounts');
const { getHexAddressFromBase32 } = require('../../utils/accountUtils');
const { requestConnector } = require('../../utils/request');
const { getAccountKnowledge } = require('../../knownAccounts');

const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getTopAccountsIndex = () => getTableInstance(
	topAccountsIndexSchema.tableName,
	topAccountsIndexSchema,
	MYSQL_ENDPOINT,
);

const getTokens = async (params) => {
	let tokensInfo;
	const tokens = {
		data: [],
		meta: {},
	};

	if (params.tokenID && !params.address) {
		throw new InvalidParamsException('tokenID based retrieval is only possible along with address');
	}

	// TODO: Add logic to retrieve symbol and name from the SDK once endpoint is available
	if (params.tokenID && params.address) {
		const response = await requestConnector('token_getBalance', {
			address: getHexAddressFromBase32(params.address), tokenID: params.tokenID,
		});

		tokensInfo = [{ ...response, tokenID: params.tokenID }];
	} else {
		const response = await requestConnector('token_getBalances', {
			address: getHexAddressFromBase32(params.address),
		});

		tokensInfo = response.balances;
	}

	tokens.data = tokensInfo.slice(params.offset, params.offset + params.limit);

	tokens.meta = {
		address: params.address,
		count: tokens.data.length,
		offset: params.offset,
		total: tokensInfo.length,
	};

	return tokens;
};

const getTopLiskAccounts = async (params) => {
	const topAccountsDB = await getTopAccountsIndex();

	const topLiskAddresses = {
		data: [],
		meta: {},
	};
	const EMPTY_STRING = '';

	const response = await topAccountsDB.find(
		params,
		Object.getOwnPropertyNames(topAccountsIndexSchema.schema),
	);

	topLiskAddresses.data = await BluebirdPromise.map(
		response,
		async (account) => {
			const accountKnowledge = await getAccountKnowledge(account.address);
			return {
				...account,
				owner: accountKnowledge ? accountKnowledge.owner : EMPTY_STRING,
				description: accountKnowledge ? accountKnowledge.description : EMPTY_STRING,
			};
		},
		{ concurrency: response.length },
	);

	topLiskAddresses.meta = {
		count: topLiskAddresses.data.length,
		offset: params.offset,
	};

	return topLiskAddresses;
};

module.exports = {
	getTokens,
	getTopLiskAccounts,
};
