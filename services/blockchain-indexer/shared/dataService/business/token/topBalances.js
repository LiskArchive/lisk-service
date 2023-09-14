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
	DB: {
		MySQL: { getTableInstance },
	},
} = require('lisk-service-framework');

const config = require('../../../../config');
const accountBalancesTableSchema = require('../../../database/schema/accountBalances');
const accountTableSchema = require('../../../database/schema/accounts');

const { getAccountKnowledge } = require('../../knownAccounts');

const MYSQL_ENDPOINT = config.endpoints.mysqlReplica;

const getAccountBalancesTable = () => getTableInstance(accountBalancesTableSchema, MYSQL_ENDPOINT);

const getTokenTopBalances = async (params) => {
	const response = {
		data: {},
		meta: {},
	};

	const accountBalancesTable = await getAccountBalancesTable();

	const { search, tokenID, ...remParams } = params;
	params = remParams;

	params[`${accountBalancesTableSchema.tableName}.tokenID`] = tokenID;

	params.leftOuterJoin = {
		targetTable: accountTableSchema.tableName,
		leftColumn: `${accountBalancesTableSchema.tableName}.address`,
		rightColumn: `${accountTableSchema.tableName}.address`,
	};

	if (search) {
		params.orSearch = [{
			property: `${accountTableSchema.tableName}.name`,
			pattern: search,
		}, {
			property: `${accountTableSchema.tableName}.address`,
			pattern: search,
		}, {
			property: `${accountTableSchema.tableName}.publicKey`,
			pattern: search,
		}];
	}

	const tokenInfos = await accountBalancesTable.find(
		params,
		[
			`${accountBalancesTableSchema.tableName}.balance`,
			`${accountBalancesTableSchema.tableName}.address`,
			`${accountTableSchema.tableName}.publicKey`,
			`${accountTableSchema.tableName}.name`,
		],
	);

	const filteredTokenInfos = [];
	// eslint-disable-next-line no-restricted-syntax
	for (const tokenInfo of tokenInfos) {
		const knowledge = getAccountKnowledge(tokenInfo.address);

		filteredTokenInfos.push({
			address: tokenInfo.address,
			publicKey: tokenInfo.publicKey,
			name: tokenInfo.name,
			balance: BigInt(tokenInfo.balance).toString(),
			knowledge,
		});
	}

	response.data[tokenID] = filteredTokenInfos;

	response.meta = {
		count: response.data[tokenID].length,
		offset: params.offset,
		total: await accountBalancesTable.count(params, [`${accountBalancesTableSchema.tableName}.address`]),
	};

	return response;
};

module.exports = {
	getTokenTopBalances,
};
