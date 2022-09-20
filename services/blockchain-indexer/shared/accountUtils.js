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
const dataService = require('./dataService');
const { LSK_ADDRESS } = require('./regex');

const isStringType = value => typeof value === 'string';

const parseAddress = address => isStringType(address) ? address.toUpperCase() : '';

const validateLisk32Address = address => (typeof address === 'string' && address.match(LSK_ADDRESS));

const confirmAddress = async address => {
	if (validateLisk32Address(address)) return false;
	const account = await dataService.getCachedAccountByAddress(parseAddress(address));
	return !!(account && account.address);
};

module.exports = {
	confirmAddress,
};
