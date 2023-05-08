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
const {
	Exceptions: {
		InvalidParamsException,
	},
	MySQL: { getTableInstance },
} = require('lisk-service-framework');
const BluebirdPromise = require('bluebird');

const config = require('../../../config');
const accountBalancesTableSchema = require('../../database/schema/accountBalances');

const { requestConnector } = require('../../utils/request');
const { getLisk32AddressFromPublicKey, getIndexedAccountInfo } = require('../../utils/account');
const { getAddressByName } = require('../../utils/validator');

const {
	LENGTH_CHAIN_ID,
	PATTERN_ANY_TOKEN_ID,
	PATTERN_ANY_CHAIN_TOKEN_ID,
} = require('../../constants');

const MYSQL_ENDPOINT = config.endpoints.mysql;
const getAccountBalancesTable = () => getTableInstance(
	accountBalancesTableSchema.tableName,
	accountBalancesTableSchema,
	MYSQL_ENDPOINT,
);

let moduleConstants = {};

const getTokenBalances = async (params) => {
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

	tokens.data = 'offset' in params && 'limit' in params
		? tokensInfo.slice(params.offset, params.offset + params.limit)
		: tokensInfo;

	tokens.meta = {
		address: params.address,
		count: tokens.data.length,
		offset: params.offset,
		total: tokensInfo.length,
	};

	return tokens;
};

const getTokenTopBalances = async (params) => {
	const response = {
		data: {},
		meta: {},
	};
	const accountBalancesTable = await getAccountBalancesTable();
	const queryParams = {
		tokenID: params.tokenID,
		sort: params.sort,
		offset: params.offset,
		limit: params.limit,
	};

	const tokenInfos = await accountBalancesTable.find(queryParams, ['address', 'balance']);

	response.data[params.tokenID] = await BluebirdPromise.map(
		tokenInfos,
		async tokenInfo => {
			const accountInfo = await getIndexedAccountInfo({ address: tokenInfo.address }, ['publicKey', 'name']);
			return {
				address: tokenInfo.address,
				publicKey: accountInfo.publicKey,
				name: accountInfo.name,
				balance: tokenInfo.balance,
				knowledge: {
					// TODO: Integrate knowledge information
				},
			};
		},
		{ concurrency: tokenInfos.length },
	);

	response.meta = {
		count: response.data[params.tokenID].length,
		offset: params.offset,
		total: await accountBalancesTable.count(queryParams),
	};

	return response;
};

const getTokenSummary = async () => {
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
		} else if (tokenID.substring(LENGTH_CHAIN_ID) === PATTERN_ANY_CHAIN_TOKEN_ID) {
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

const tokenHasUserAccount = async (params) => {
	const response = {
		data: {
			isExists: false,
		},
		meta: {},
	};

	const { tokenID } = params;
	let { address } = params;

	if (!address && params.name) {
		address = await getAddressByName(params.name);
	}

	if (!address && params.publicKey) {
		address = getLisk32AddressFromPublicKey(params.publicKey);
	}

	// Check existence if address found. Return false otherwise
	if (address) {
		const { exists: isExists } = await requestConnector('tokenHasUserAccount', { address, tokenID });
		response.data.isExists = isExists;
	}

	return response;
};

const getTokenConstants = async () => {
	if (!Object.getOwnPropertyNames(moduleConstants).length) {
		const initializationFees = await requestConnector('getTokenInitializationFees');
		moduleConstants = {
			extraCommandFees: {
				userAccountInitializationFee: initializationFees.userAccount,
				escrowAccountInitializationFee: initializationFees.escrowAccount,
			},
		};
	}

	return {
		data: moduleConstants,
		meta: {},
	};
};

const getAvailableTokenIDs = async (params) => {
	const response = {
		data: {},
		meta: {},
	};
	const accountBalancesTable = await getAccountBalancesTable();

	const tokenInfos = await accountBalancesTable.find(
		{
			distinct: 'tokenID',
			sort: params.sort,
			offset: params.offset,
			limit: params.limit,
		},
		['tokenID'],
	);

	response.data.tokenIDs = tokenInfos.map(tokenInfo => tokenInfo.tokenID);
	response.meta = {
		count: response.data.tokenIDs.length,
		offset: params.offset,
		total: await accountBalancesTable.count({ distinct: 'tokenID' }),
	};

	return response;
};

module.exports = {
	tokenHasUserAccount,
	getAvailableTokenIDs,
	getTokenBalances,
	getTokenSummary,
	getTokenConstants,
	getTokenTopBalances,
};
