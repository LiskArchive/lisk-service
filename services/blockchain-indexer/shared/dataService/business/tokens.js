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
		ValidationException,
	},
} = require('lisk-service-framework');

const topLSKAddressesIndexSchema = require('../../database/schema/topLSKAddresses');
const { getHexAddressFromBase32 } = require('../../utils/accountUtils');
const { requestConnector, requestAppRegistry } = require('../../utils/request');
const regex = require('../../utils/regex');
const { getAccountKnowledge } = require('../../knownAccounts');

const config = require('../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getTopLSKAddressesIndex = () => getTableInstance(
	topLSKAddressesIndexSchema.tableName,
	topLSKAddressesIndexSchema,
	MYSQL_ENDPOINT,
);

const getTokenMetadataByID = async (tokenID) => {
	if (!tokenID.match(regex.TOKEN_ID)) throw new ValidationException('Invalid TokenID');

	const chainID = tokenID.slice(0, 8);
	const tokenMetadata = await requestAppRegistry('blockchain.apps.meta.tokens', { chainID, tokenID });
	return tokenMetadata;
};

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

	// TODO: Enable the code once token metadata is available
	// tokens.data = await BluebirdPromise.map(
	// 	tokensInfo,
	// 	async tokenInfo => {
	// 		const [tokenMetadata] = (await getTokenMetadataByID(tokenInfo.tokenID)).data;
	// 		return {
	// 			...tokenInfo,
	// 			symbol: tokenMetadata.symbol,
	// 			name: tokenMetadata.tableName,
	// 		};
	// 	},
	// 	{ concurrency: tokensInfo.length },
	// );

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

const getSupportedTokens = async (params) => {
	const supportedTokensList = {
		data: {
			supportedTokens: [],
		},
		meta: {},
	};

	const response = await requestConnector('token_getSupportedTokens');

	supportedTokensList.data.supportedTokens = await BluebirdPromise.map(
		response.tokenIDs,
		async (tokenID) => {
			const tokenMetadataResponse = await getTokenMetadataByID(tokenID);
			const [tokenMetadata = {}] = tokenMetadataResponse.data || [];

			return {
				tokenID,
				symbol: tokenMetadata.symbol,
				name: tokenMetadata.tokenName,
			};
		},
		{ concurrency: response.tokenIDs.length },
	);

	const total = supportedTokensList.data.supportedTokens.length;
	supportedTokensList.data.supportedTokens = supportedTokensList.data.supportedTokens
		.slice(params.offset, params.offset + params.limit);

	supportedTokensList.meta = {
		count: supportedTokensList.data.supportedTokens.length,
		offset: params.offset,
		total,
	};

	return supportedTokensList;
};

module.exports = {
	getTokens,
	getTopLiskAddresses,
	getSupportedTokens,
};
