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
	Exceptions: {
		InvalidParamsException,
	},
} = require('lisk-service-framework');

const topLSKAddressesIndexSchema = require('../../database/schema/topLSKAddresses');
const { requestConnector } = require('../../utils/request');
const { getAccountKnowledge } = require('../../knownAccounts');

const config = require('../../../config');

const {
	LENGTH_CHAIN_ID,
	PATTERN_ANY_TOKEN_ID,
	PATTERN_ANY_LOCAL_ID,
} = require('../../constants');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getTopLSKAddressesIndex = () => getTableInstance(
	topLSKAddressesIndexSchema.tableName,
	topLSKAddressesIndexSchema,
	MYSQL_ENDPOINT,
);

const getTokens = async (params) => {
	const tokensInfo = [];
	const tokens = {
		data: [],
		meta: {},
	};

	if (params.tokenID && !params.address) {
		throw new InvalidParamsException('tokenID based retrieval is only possible along with address.');
	}

	if (params.tokenID && params.address) {
		const response = await requestConnector(
			'getTokenBalance',
			{ address: params.address, tokenID: params.tokenID });

		tokensInfo.push({ ...response, tokenID: params.tokenID });
	} else {
		const response = await requestConnector(
			'getTokenBalances',
			{ address: params.address });

		if (response.balances) tokensInfo.push(...response.balances);
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

const getTopLiskAddresses = async (params) => {
	const topLSKAddressesDB = await getTopLSKAddressesIndex();

	const topLiskAddresses = {
		data: [],
		meta: {},
	};
	const EMPTY_STRING = '';

	const response = await topLSKAddressesDB.find(
		params,
		Object.getOwnPropertyNames(topLSKAddressesIndexSchema.schema),
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

const getTokensSummary = async () => {
	const summary = {
		data: {},
		meta: {},
	};

	const { escrowedAmounts } = await requestConnector('getEscrowedAmounts');
	const { totalSupply } = await requestConnector('getTotalSupply');
	const { supportedTokens: supportedTokenIDs } = await requestConnector('getSupportedTokens');

	const supportedTokens = {
		isSupportAllTokens: false,
		exactTokenIDs: [],
		patternTokenIDs: [],
	};

	supportedTokenIDs.forEach(tokenID => {
		if (tokenID === PATTERN_ANY_TOKEN_ID) {
			supportedTokens.isSupportAllToken = true;
		} else if (tokenID.substring(LENGTH_CHAIN_ID) === PATTERN_ANY_LOCAL_ID) {
			supportedTokens.patternTokenIDs.push(tokenID);
		} else {
			supportedTokens.exactTokenIDs.push(tokenID);
		}
	});

	summary.data = {
		escrowedAmounts,
		supportedTokens: {
			...supportedTokens,
			exactTokenIDs: [...new Set(supportedTokens.exactTokenIDs)],
			patternTokenIDs: [...new Set(supportedTokens.patternTokenIDs)],
		},
		totalSupply,
	};

	return summary;
};

module.exports = {
	getTokens,
	getTopLiskAddresses,
	getTokensSummary,
};
