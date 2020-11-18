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
const { getDelegates } = require('./delegates');

const getUsernameByAddress = async (address) => {
	const dbResult = await getDelegates({ address });
	if (dbResult.length === 1) return dbResult[0].username;
	return null;
};

const getAddressByUsername = async (username) => {
	const dbResult = await getDelegates({ username });
	if (dbResult.length === 1) return dbResult[0].address;
	return null;
};

module.exports = {
	getUsernameByAddress,
	getAddressByUsername,
};
