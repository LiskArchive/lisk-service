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
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { requestConnector } = require('../utils/request');
const commissionsTableSchema = require('../database/schema/commissions');
const stakesTableSchema = require('../database/schema/stakes');

const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysqlPrimary;

const getCommissionsTable = () => getTableInstance(commissionsTableSchema, MYSQL_ENDPOINT);
const getStakesTable = () => getTableInstance(stakesTableSchema, MYSQL_ENDPOINT);

const indexValidatorCommissionInfo = async (genesisBlock) => {
	const commissionsTable = await getCommissionsTable();
	const validators = await requestConnector('getPoSGenesisValidators', { height: genesisBlock.height });
	const commissionInfo = validators.map(validator => ({
		address: validator.address,
		height: genesisBlock.height,
		commission: validator.commission,
	}));
	if (commissionInfo.length) await commissionsTable.upsert(commissionInfo);
};

const indexStakersInfo = async (genesisBlock) => {
	const stakesTable = await getStakesTable();
	const stakers = await requestConnector('getPoSGenesisStakers', { height: genesisBlock.height });
	const stakestoIndex = [];
	await stakers.forEach(async staker => staker.stakes.forEach(stake => {
		stakestoIndex.push({
			stakerAddress: staker.address,
			validatorAddress: stake.validatorAddress,
			amount: stake.amount,
		});
	}));

	if (stakestoIndex.length) await stakesTable.upsert(stakestoIndex);
};

module.exports = {
	indexValidatorCommissionInfo,
	indexStakersInfo,
};
