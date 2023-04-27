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
const { math: { q96 } } = require('@liskhq/lisk-utils');
const {
	CacheRedis,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../config');
const { MAX_COMMISSION } = require('../constants');
const accountsIndexSchema = require('../database/schema/accounts');
const commissionsTableSchema = require('../database/schema/commissions');
const stakesTableSchema = require('../database/schema/stakes');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const validatorCache = CacheRedis('validator', config.endpoints.cache);

const maxCommissionQ = q96(MAX_COMMISSION);

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

const calcCommission = async (generatorAddress, reward) => {
	const commissionsTable = await getCommissionsTable();
	const [{ commission: currentCommission } = {}] = await commissionsTable
		.find({ address: generatorAddress, sort: 'height:desc', limit: 1 }, 'commission');

	const rewardQ = q96(reward);
	const currentCommissionQ = q96(BigInt(currentCommission || 0));
	const commission = (rewardQ.mul(currentCommissionQ)).div(maxCommissionQ);
	return commission.floor();
};

const calcSelfStakeReward = async (generatorAddress, reward, commission) => {
	let selfStakeReward = q96(BigInt('0'));

	const stakesTable = await getStakesTable();
	const stakerInfo = await stakesTable.find(
		{ validatorAddress: generatorAddress }, ['stakerAddress', 'amount'],
	);

	if (stakerInfo.length) {
		const selfStakesInfo = stakerInfo.filter(stake => stake.stakerAddress === generatorAddress);
		const selfStakes = selfStakesInfo.reduce((a, b) => BigInt(a.amount) + BigInt(b.amount), BigInt('0'));
		const totalStakes = stakerInfo.reduce((a, b) => BigInt(a.amount) + BigInt(b.amount), BigInt('0'));

		const rewardQ = q96(reward);
		const commissionQ = q96(commission);
		const selfStakesQ = q96(selfStakes);
		const totalStakesQ = q96(totalStakes);
		const remCommissionQ = q96(maxCommissionQ.sub(commissionQ));

		const rewardFractionQ = rewardQ.mul(remCommissionQ);
		selfStakeReward = (rewardFractionQ.mul(selfStakesQ)).div(totalStakesQ.mul(maxCommissionQ));
	}

	return selfStakeReward.floor();
};

module.exports = {
	getNameByAddress,
	getAddressByName,
	calcCommission,
	calcSelfStakeReward,
};
