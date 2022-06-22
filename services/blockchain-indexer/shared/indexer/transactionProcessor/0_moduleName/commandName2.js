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

const entityIndexSchema = require('../../../database/schema/transactions');

const getEntityIndex = () => getTableInstance('entity_index_name', entityIndexSchema, MYSQL_ENDPOINT);

// Declare and export the following command specific constants
export const commandID = 0;
export const commandName = 'commandName';

// Implement the custom logic in the 'processTransaction' method and export it
export const processTransaction = async (blockHeader, tx, dbTrx) => {
	const entityDB = await getEntityIndex();

	const entityIndexEntry = { ...tx };
	// Process the transaction to create the entityIndexEntry
	// And, finally, perform DB operations to update the index
	await entityDB.upsert(entityIndexEntry, dbTrx); // it is important to pass dbTrx
	logger.debug('Add custom logs');

	Promise.resolve({ blockHeader, tx });
};
