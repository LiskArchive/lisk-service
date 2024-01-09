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
const { invokeEndpoint } = require('./client');
const { isMainchain } = require('./interoperability');

let escrowedAmounts;
let supportedTokens;
let totalSupply;
let initializationFees;

const getTokenBalances = async address => {
	const balances = await invokeEndpoint('token_getBalances', { address });
	return balances;
};

const getTokenBalance = async ({ address, tokenID }) => {
	const balance = await invokeEndpoint('token_getBalance', { address, tokenID });
	return balance;
};

const getEscrowedAmounts = async (isForceUpdate = false) => {
	if (isForceUpdate || !escrowedAmounts) {
		escrowedAmounts = await invokeEndpoint('token_getEscrowedAmounts');
	}
	return escrowedAmounts;
};

const getSupportedTokens = async (isForceUpdate = false) => {
	if (isForceUpdate || !supportedTokens) {
		supportedTokens = await invokeEndpoint('token_getSupportedTokens');
	}
	return supportedTokens;
};

const getTotalSupply = async (isForceUpdate = false) => {
	if (isForceUpdate || !totalSupply) {
		totalSupply = await invokeEndpoint('token_getTotalSupply');
	}
	return totalSupply;
};

const getTokenInitializationFees = async () => {
	if (!initializationFees) {
		const response = await invokeEndpoint('token_getInitializationFees');
		if (response.error) throw new Error(response.error);
		initializationFees = response;
	}
	return initializationFees;
};

const hasUserAccount = async ({ address, tokenID }) =>
	invokeEndpoint('token_hasUserAccount', { address, tokenID });

const hasEscrowAccount = async ({ tokenID, escrowChainID }) =>
	invokeEndpoint('token_hasEscrowAccount', { tokenID, escrowChainID });

const updateTokenInfo = async () => {
	escrowedAmounts = await getEscrowedAmounts(true);
	if (!(await isMainchain()) || !supportedTokens) supportedTokens = await getSupportedTokens(true);
	totalSupply = await getTotalSupply(true);
};

module.exports = {
	tokenHasUserAccount: hasUserAccount,
	tokenHasEscrowAccount: hasEscrowAccount,
	getTokenBalance,
	getTokenBalances,
	getEscrowedAmounts,
	getSupportedTokens,
	getTotalSupply,
	getTokenInitializationFees,
	updateTokenInfo,
};
