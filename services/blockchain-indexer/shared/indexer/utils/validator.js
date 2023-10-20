/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
	math: { q96 },
} = require('@liskhq/lisk-utils');
const {
	DB: {
		MySQL: { getTableInstance },
	},
} = require('lisk-service-framework');

const config = require('../../../config');
const { MAX_COMMISSION } = require('../../constants');
const commissionsTableSchema = require('../../database/schema/commissions');
const stakesTableSchema = require('../../database/schema/stakes');

const MYSQL_ENDPOINT_REPLICA = config.endpoints.mysqlReplica;
const maxCommissionQ = q96(MAX_COMMISSION);

const getCommissionsTable = () => getTableInstance(commissionsTableSchema, MYSQL_ENDPOINT_REPLICA);
const getStakesTable = () => getTableInstance(stakesTableSchema, MYSQL_ENDPOINT_REPLICA);

const calcCommissionAmount = async (generatorAddress, blockHeight, blockReward) => {
	const commissionsTable = await getCommissionsTable();

	const queryParams = {
		address: generatorAddress,
		propBetweens: [
			{
				property: 'height',
				lowerThan: blockHeight,
			},
		],
		sort: 'height:desc',
		limit: 1,
	};
	const [{ commission } = { commission: 0 }] = await commissionsTable.find(queryParams, [
		'commission',
	]);

	const blockRewardQ = q96(blockReward);
	const currentCommissionQ = q96(BigInt(commission));
	const commissionAmount = blockRewardQ.muldiv(currentCommissionQ, maxCommissionQ);
	return commissionAmount.floor();
};

const calcSelfStakeReward = async (generatorAddress, blockReward, commissionAmount) => {
	const stakesTable = await getStakesTable();
	const stakerInfo = await stakesTable.find({ validatorAddress: generatorAddress }, [
		'stakerAddress',
		'amount',
	]);

	if (stakerInfo.length) {
		const selfStakesInfo = stakerInfo.filter(stake => stake.stakerAddress === generatorAddress);
		const { amount: selfStakes } = selfStakesInfo.reduce(
			(a, b) => ({ amount: BigInt(a.amount) + BigInt(b.amount) }),
			{ amount: BigInt('0') },
		);
		const { amount: totalStakes } = stakerInfo.reduce(
			(a, b) => ({ amount: BigInt(a.amount) + BigInt(b.amount) }),
			{ amount: BigInt('0') },
		);

		const selfStakesQ = q96(selfStakes);
		const totalStakesQ = q96(totalStakes);
		const blockRewardQ = q96(blockReward);
		const commissionAmountQ = q96(commissionAmount);
		const remBlockRewardQ = blockRewardQ.sub(commissionAmountQ);

		const selfStakeRewardQ = remBlockRewardQ.muldiv(selfStakesQ, totalStakesQ);
		return selfStakeRewardQ.floor();
	}

	return BigInt('0');
};

module.exports = {
	calcCommissionAmount,
	calcSelfStakeReward,
};
