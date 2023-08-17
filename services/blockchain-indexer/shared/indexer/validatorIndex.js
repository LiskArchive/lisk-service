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
	DB: { MySQL: { getTableInstance } },
} = require('lisk-service-framework');

const { requestConnector } = require('../utils/request');
const commissionsTableSchema = require('../database/schema/commissions');
const stakesTableSchema = require('../database/schema/stakes');

const {
	getBlockByHeight,
} = require('../dataService');
const { getGenesisHeight } = require('../constants');

const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getCommissionsTable = () => getTableInstance(commissionsTableSchema, MYSQL_ENDPOINT);
const getStakesTable = () => getTableInstance(stakesTableSchema, MYSQL_ENDPOINT);

const indexValidatorCommissionInfo = async () => {
	const genesisBlock = await getBlockByHeight(await getGenesisHeight());
	const commissionsTable = await getCommissionsTable();
	const validators = await requestConnector('getPoSGenesisValidators');
	const commissionInfo = validators.map(validator => ({
		address: validator.address,
		height: genesisBlock.height,
		commission: validator.commission,
	}));
	if (commissionInfo.length) await commissionsTable.upsert(commissionInfo);
};

const indexStakersInfo = async () => {
	const stakesTable = await getStakesTable();
	const stakers = await requestConnector('getPoSGenesisStakers');
	const stakesToIndex = [];
	await stakers.forEach(async staker => staker.stakes.forEach(stake => {
		stakesToIndex.push({
			stakerAddress: staker.address,
			validatorAddress: stake.validatorAddress,
			amount: stake.amount,
		});
	}));

	if (stakesToIndex.length) await stakesTable.upsert(stakesToIndex);
};

module.exports = {
	indexValidatorCommissionInfo,
	indexStakersInfo,
};
