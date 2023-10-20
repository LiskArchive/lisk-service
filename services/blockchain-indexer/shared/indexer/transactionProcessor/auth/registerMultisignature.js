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
	DB: {
		MySQL: { getTableInstance },
	},
} = require('lisk-service-framework');
const config = require('../../../../config');

const { TRANSACTION_STATUS } = require('../../../constants');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const multisignatureTableSchema = require('../../../database/schema/multisignature');
const { indexAccountPublicKey } = require('../../accountIndex');

const getMultisignatureTable = () => getTableInstance(multisignatureTableSchema, MYSQL_ENDPOINT);

// Command specific constants
const COMMAND_NAME = 'registerMultisignature';

const resolveMultisignatureMemberships = tx => {
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
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	// Asynchronously index all the publicKeys
	tx.params.mandatoryKeys.forEach(key => indexAccountPublicKey(key));
	tx.params.optionalKeys.forEach(key => indexAccountPublicKey(key));

	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESSFUL) return;

	const multisignatureTable = await getMultisignatureTable();

	logger.trace(
		`Indexing multisignature information in transaction ${tx.id} contained in block at height ${tx.height}.`,
	);
	const multisignatureInfoToIndex = resolveMultisignatureMemberships(tx);
	await multisignatureTable.upsert(multisignatureInfoToIndex, dbTrx);
	logger.debug(
		`Indexed multisignature information in transaction ${tx.id} contained in block at height ${tx.height}.`,
	);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	// Asynchronously index all the publicKeys
	tx.params.mandatoryKeys.forEach(key => indexAccountPublicKey(key));
	tx.params.optionalKeys.forEach(key => indexAccountPublicKey(key));

	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESSFUL) return;

	const multisignatureTable = await getMultisignatureTable();

	const multisignatureInfo = resolveMultisignatureMemberships(tx);
	const multisignatureIdsToDelete = multisignatureInfo.map(item => item.id);

	logger.trace(
		`Reverting multisignature information in transaction ${tx.id} contained in block at height ${tx.height}.`,
	);
	await multisignatureTable.deleteByPrimaryKey(multisignatureIdsToDelete, dbTrx);
	logger.debug(
		`Reverted multisignature information in transaction ${tx.id} contained in block at height ${tx.height}.`,
	);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
