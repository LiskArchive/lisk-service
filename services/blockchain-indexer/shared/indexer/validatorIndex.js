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

const commissionsTableSchema = require('../database/schema/commissions');
const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getCommissionsTable = () => getTableInstance(
	commissionsTableSchema.tableName,
	commissionsTableSchema,
	MYSQL_ENDPOINT,
);

const indexCommissionInfo = async (genesisBlock) => {
	const commissionsTable = await getCommissionsTable();
	const { validators } = (genesisBlock.assets.find(asset => asset.module === 'pos')).data;
	const commissionInfo = validators.map(validator => ({
		address: validator.address,
		height: genesisBlock.height,
		commission: validator.commission,
	}));
	await commissionsTable.upsert(commissionInfo);
};

const indexStakeInfo = async (genesisBlock) => {
	const { stakers } = (genesisBlock.assets.find(asset => asset.module === 'pos')).data;
};

module.exports = {
	indexCommissionInfo,
	indexStakeInfo,
};
