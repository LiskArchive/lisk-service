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

const MYSQL_ENDPOINT = config.endpoints.mysql;

const logger = Logger();

/** * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                      *
 *      Make necessary changes below this section       *
 *                                                      *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const entityTableSchema = require('../../../database/schema/transactions');

const getEntityTable = () => getTableInstance(
	entityTableSchema.tableName,
	entityTableSchema,
	MYSQL_ENDPOINT,
);

// Declare and export the following command specific constants
export const COMMAND_NAME = 'command';

// Implement the custom logic in the 'applyTransaction' method and export it
export const applyTransaction = async (blockHeader, tx, dbTrx) => {
	const entityTable = await getEntityTable();

	const entityTableEntry = { ...tx };
	// Process the transaction to create the entityTableEntry
	// And, finally, perform DB operations to update the index
	await entityTable.upsert(entityTableEntry, dbTrx); // it is important to pass dbTrx
	logger.debug('Add custom logs');

	Promise.resolve({ blockHeader, tx });
};

// Implement the custom logic in the 'revertTransaction' method and export it
// This logic is executed to revert the effect of 'applyTransaction' method in case of deleteBlock
export const revertTransaction = async (blockHeader, tx, dbTrx) => {
	const entityTable = await getEntityTable();

	const entityTableEntry = { ...tx };
	// Process the transaction to create the entityTableEntry
	// And, finally, perform DB operations to update the index and revert the induced changes
	await entityTable.delete(entityTableEntry, dbTrx); // it is important to pass dbTrx
	logger.debug('Add custom logs');

	Promise.resolve({ blockHeader, tx });
};
