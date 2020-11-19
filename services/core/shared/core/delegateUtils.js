/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const pouchdb = require('../pouchdb');
const config = require('../../config');

const getUsernameByAddress = async (address) => {
	const db = await pouchdb(config.db.collections.delegates.name);
	const dbResult = await db.find({ selector: { address } });
	if (dbResult.length === 1) return dbResult[0].username;
	return null;
};

const getAddressByUsername = async (username) => {
	const db = await pouchdb(config.db.collections.delegates.name);
	const dbResult = await db.find({ selector: { username } });
	if (dbResult.length === 1) return dbResult[0].username;
	return null;
};

module.exports = {
	getUsernameByAddress,
	getAddressByUsername,
};
