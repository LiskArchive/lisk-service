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
const business = require('../business');

const tokenHasUserAccount = async (params) => business.tokenHasUserAccount(params);

const getAvailableTokenIDs = async (params) => business.getAvailableTokenIDs(params);

const getTokenBalances = async (params) => business.getTokenBalances(params);

const getTokenSummary = async (params) => business.getTokenSummary(params);

const getTokenConstants = async () => business.getTokenConstants();

const getTokenTopBalances = async (params) => business.getTokenTopBalances(params);

module.exports = {
	tokenHasUserAccount,
	getAvailableTokenIDs,
	getTokenBalances,
	getTokenSummary,
	getTokenConstants,
	getTokenTopBalances,
};
