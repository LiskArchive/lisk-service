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
const config = require('../../../../config');

const {
	getLisk32AddressFromPublicKey,
} = require('../../../utils/accountUtils');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const multisignatureIndexSchema = require('../../../database/schema/multisignature');

const getMultisignatureIndex = () => getTableInstance('multisignature', multisignatureIndexSchema, MYSQL_ENDPOINT);

// Command specific constants
const commandName = 'registerMultisignatureGroup';

const resolveMultisignatureMemberships = (tx) => {
	const multisignatureInfoToIndex = [];
	const allKeys = tx.params.mandatoryKeys.concat(tx.params.optionalKeys);

	allKeys.forEach(key => {
		const members = {
			id: tx.senderAddress.concat('_', getLisk32AddressFromPublicKey(key)),
			memberAddress: getLisk32AddressFromPublicKey(key),
			groupAddress: tx.senderAddress,
		};
		multisignatureInfoToIndex.push(members);
	});

	return multisignatureInfoToIndex;
};

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, dbTrx) => {
	const multisignatureDB = await getMultisignatureIndex();

	const multisignatureInfoToIndex = resolveMultisignatureMemberships(tx);

	logger.trace(`Indexing multisignature information in transaction ${tx.id} contained in block at height ${tx.height}`);
	await multisignatureDB.upsert(multisignatureInfoToIndex, dbTrx);
	logger.debug(`Indexed multisignature information in transaction ${tx.id} contained in block at height ${tx.height}`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, dbTrx) => {
	const multisignatureDB = await getMultisignatureIndex();

	const multisignatureInfo = resolveMultisignatureMemberships(tx);
	const multisignatureIdsToDelete = multisignatureInfo.map(item => item.id);

	logger.trace(`Reverting multisignature information in transaction ${tx.id} contained in block at height ${tx.height}`);
	await multisignatureDB.deleteByPrimaryKey(multisignatureIdsToDelete, dbTrx);
	logger.debug(`Reverted multisignature information in transaction ${tx.id} contained in block at height ${tx.height}`);
};

module.exports = {
	commandName,
	applyTransaction,
	revertTransaction,
};
