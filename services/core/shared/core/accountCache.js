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
const { Logger } = require('lisk-service-framework');

const logger = Logger();

let accounts = [];

const retrieveTopAccounts = async (core) => {
	const limit = 100;
    accounts = await core.getAccounts({ limit, sort: 'balance:asc' });
    logger.debug('Updated accounts cache.');
};

const get = () => new Promise((resolve) => {
	resolve(accounts);
});


const reloadAccounts = core => {
	retrieveTopAccounts(core);
};

module.exports = {
    reloadAccounts,
    get,
};
