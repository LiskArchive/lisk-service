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
	Logger,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { getLisk32AddressFromPublicKey } = require('../../../utils/accountUtils');

const config = require('../../../../config');

const keyValueTable = require('../../../database/mysqlKVStore');

const { KEY_VALUE_TABLE_KEYS } = require('../../../constants');

const stakesTableSchema = require('../../../database/schema/stakes');

const { getPosTokenID } = require('../../../dataService/business/pos/constants');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getStakesTable = () => getTableInstance(
	stakesTableSchema.tableName,
	stakesTableSchema,
	MYSQL_ENDPOINT,
);

// Command specific constants
const COMMAND_NAME = 'stake';

const getStakeIndexingInfo = async (tx) => {
	const stakes = await BluebirdPromise.map(
		tx.params.stakes,
		async stake => {
			const stakeEntry = {};

			stakeEntry.stakerAddress = getLisk32AddressFromPublicKey(tx.senderPublicKey);
			stakeEntry.validatorAddress = stake.validatorAddress;
			stakeEntry.amount = stake.amount;
			return stakeEntry;
		},
		{ concurrency: tx.params.stakes.length },
	);

	return stakes;
};

const incrementStakeTrx = async (stake, trx) => {
	const stakesTable = await getStakesTable();

	const incrementParam = {
		increment: {
			amount: BigInt(stake.amount),
		},
		where: {
			stakerAddress: stake.stakerAddress,
			validatorAddress: stake.validatorAddress,
		},
	};

	const numRowsAffected = await stakesTable.increment(incrementParam, trx);
	if (numRowsAffected === 0) {
		await stakesTable.upsert(stake, trx);
	}
};

const decrementStakeTrx = async (stake, trx) => {
	const stakesTable = await getStakesTable();

	const decrementParam = {
		decrement: {
			amount: BigInt(stake.amount),
		},
		where: {
			stakerAddress: stake.stakerAddress,
			validatorAddress: stake.validatorAddress,
		},
	};

	await stakesTable.decrement(decrementParam, trx);
};

const updateTotalStake = async (changeAmount) => {
	const tokenID = await getPosTokenID();
	const tokenKey = `${KEY_VALUE_TABLE_KEYS.TOTAL_STAKED_PREFIX}_${tokenID}`;
	const curStakedAmount = BigInt(await keyValueTable.get(tokenKey) || 0);
	const newStakedAmount = curStakedAmount + changeAmount;

	if (newStakedAmount === 0) {
		await keyValueTable.delete(tokenKey);
	} else {
		await keyValueTable.set(tokenKey, newStakedAmount);
	}
};

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, dbTrx) => {
	const stakes = await getStakeIndexingInfo(tx);
	let totalStakeChange = BigInt(0);

	logger.trace(`Indexing transaction ${tx.id} contained in block at height ${tx.height}.`);
	await BluebirdPromise.map(
		stakes,
		async (stake) => {
			incrementStakeTrx(stake, dbTrx);
			totalStakeChange += BigInt(stake.amount);
		},
		{ concurrency: 1 },
	);
	// Update total stake amount in key value store table
	await updateTotalStake(totalStakeChange);
	logger.debug(`Indexed transaction ${tx.id} contained in block at height ${tx.height}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, dbTrx) => {
	const stakes = await getStakeIndexingInfo(tx);
	let totalStakeChange = BigInt(0);

	logger.trace(`Reverting stakes in transaction ${tx.id} contained in block at height ${tx.height}.`);
	await BluebirdPromise.map(
		stakes,
		async (stake) => {
			decrementStakeTrx(stake, dbTrx);
			totalStakeChange += BigInt(stake.amount);
		},
		{ concurrency: 1 },
	);
	// Update total stake amount in key value store table. Negate to reverse the impact
	await updateTotalStake(-totalStakeChange);
	logger.debug(`Reverted stakes in transaction ${tx.id} contained in block at height ${tx.height}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
