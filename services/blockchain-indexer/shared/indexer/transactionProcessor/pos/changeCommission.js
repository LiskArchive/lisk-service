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
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const config = require('../../../../config');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const commissionsTableSchema = require('../../../database/schema/commissions');

const getCommissionsTable = () => getTableInstance(commissionsTableSchema, MYSQL_ENDPOINT);

// Command specific constants
const COMMAND_NAME = 'changeCommission';

const getCommissionIndexingInfo = (blockHeader, tx) => {
	const { newCommission } = tx.params;

	const newCommissionEntry = {
		address: getLisk32AddressFromPublicKey(tx.senderPublicKey),
		commission: newCommission,
		height: blockHeader.height,
	};

	return newCommissionEntry;
};

const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	const commissionsTable = await getCommissionsTable();

	const commissionInfo = getCommissionIndexingInfo(blockHeader, tx);

	logger.trace(`Indexing commission update for address ${commissionInfo.address} at height ${commissionInfo.height}.`);
	await commissionsTable.upsert(commissionInfo, dbTrx);
	logger.debug(`Indexed commission update for address ${commissionInfo.address} at height ${commissionInfo.height}.`);
};

const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	const commissionsTable = await getCommissionsTable();

	const commissionInfo = getCommissionIndexingInfo(blockHeader, tx);

	logger.trace(`Remove commission entry for address ${commissionInfo.address} at height ${commissionInfo.height}.`);
	await commissionsTable.delete(commissionInfo, dbTrx);
	logger.debug(`Remove commission entry for address ${commissionInfo.address} at height ${commissionInfo.height}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
