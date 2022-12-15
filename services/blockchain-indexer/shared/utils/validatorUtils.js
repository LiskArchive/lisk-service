/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
	CacheRedis,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../config');
const accountsIndexSchema = require('../database/schema/accounts');
const commissionsTableSchema = require('../database/schema/commissions');
const stakesTableSchema = require('../database/schema/stakes');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const validatorCache = CacheRedis('validator', config.endpoints.cache);

const getAccountsIndex = () => getTableInstance(
	accountsIndexSchema.tableName,
	accountsIndexSchema,
	MYSQL_ENDPOINT,
);

const getCommissionsTable = () => getTableInstance(
	commissionsTableSchema.tableName,
	commissionsTableSchema,
	MYSQL_ENDPOINT,
);

const getStakesTable = () => getTableInstance(
	stakesTableSchema.tableName,
	stakesTableSchema,
	MYSQL_ENDPOINT,
);

const getNameByAddress = async (address) => {
	if (address) {
		const name = await validatorCache.get(address);
		if (name) {
			// Update the account index with the name asynchronously
			const accountsTable = await getAccountsIndex();
			accountsTable.upsert({ address, name });

			return name;
		}
	}
	return null;
};

const getAddressByName = async (name) => {
	if (name) {
		const address = await validatorCache.get(name);
		if (address) return address;
	}
	return null;
};

const calculateCommission = async (generatorAddress, reward) => {
	const commissionsTable = await getCommissionsTable();
	const [{ commission: currentCommission }] = await commissionsTable
		.find({ address: generatorAddress, sort: 'height:desc', limit: 1 }, 'commission');
	const commission = (reward * currentCommission) / BigInt('100');
	return commission;
};

// TODO: Verify
const calculateSelfStakeRewards = async (generatorAddress) => {
	const stakesTable = await getStakesTable();
	const stakerInfo = await stakesTable.find({ validatorAddress: generatorAddress });
	const selfStakes = stakerInfo.map(stake => stake.stakerAddress === generatorAddress);

	const selfStakeWeight = selfStakes.reduce((a, b) => a.amount + b.amount);
	const totalStakeWeight = stakerInfo.reduce((a, b) => a.amount + b.amount);

	const selfStakeReward = (selfStakeWeight / totalStakeWeight) * 100;
	return selfStakeReward;
};

module.exports = {
	getNameByAddress,
	getAddressByName,
	calculateCommission,
	calculateSelfStakeRewards,
};
