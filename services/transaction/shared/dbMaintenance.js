/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const logger = require('lisk-service-framework').Logger();

const mysqlIndex = require('./indexdb/mysql');
const multisignatureTxIndexSchema = require('./schema/multisignature');
// const multisigSignaturePoolSchema = require('./schema/multisigSignaturePool');

const getIndex = (tableName, tableSchema) => mysqlIndex(tableName, tableSchema);

const multisigTableName = 'MultisignatureTx';
const multisigPoolTableName = 'MultisigSignaturePool';

const prune = async (params) => {
	const multisignatureTxDB = await getIndex(multisigTableName, multisignatureTxIndexSchema);
	// const multisignaturePool = await getIndex(multisigPoolTableName, multisigSignaturePoolSchema);

	const result = await multisignatureTxDB.find(params);
	const serviceIdsToDelete = result.map(r => r[`${multisignatureTxIndexSchema.primaryKey}`]);
	// Fetch the id(s) corresponding the serviceIdsToDelete
	// const idstoDelete = multisignaturePool.find({
	// 	whereIn: {
	// 		property: 'serviceId',
	// 		values: serviceIdsToDelete,
	// 	},
	// }, ['id']);
	logger.debug(`Removing ${result.length} entries from '${multisigTableName}' and ${multisigPoolTableName} index`);
	await multisignatureTxDB.deleteIds(serviceIdsToDelete);
	// await multisignaturePool.deleteIds(idstoDelete);
};

module.exports = {
	prune,
};
