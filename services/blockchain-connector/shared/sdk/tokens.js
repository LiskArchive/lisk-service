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
const { Exceptions: { TimeoutException }, Logger } = require('lisk-service-framework');
const { timeoutMessage, invokeEndpoint } = require('./client');

const logger = Logger();

let escrowedAmounts;

const getTokenBalances = async (address) => {
	try {
		const balances = await invokeEndpoint('token_getBalances', { address });
		return balances;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getTokenBalances\'.');
		}
		logger.warn(`Error returned when invoking 'token_getBalances'.\n${err.stack}`);
		throw err;
	}
};

const getTokenBalance = async ({ address, tokenID }) => {
	try {
		const balance = await invokeEndpoint('token_getBalance', { address, tokenID });
		return balance;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getTokenBalance\'.');
		}
		logger.warn(`Error returned when invoking 'token_getBalance'.\n${err.stack}`);
		throw err;
	}
};

const getEscrowedAmounts = async (isForceUpdate = false) => {
	try {
		if (isForceUpdate || !escrowedAmounts) {
			escrowedAmounts = await invokeEndpoint('token_getEscrowedAmounts');
		}
		return escrowedAmounts;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getEscrowedAmounts\'.');
		}
		logger.warn(`Error returned when invoking 'token_getEscrowedAmounts'.\n${err.stack}`);
		throw err;
	}
};

const getSupportedTokens = async () => {
	try {
		return invokeEndpoint('token_getSupportedTokens');
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getSupportedTokens\'.');
		}
		logger.warn(`Error returned when invoking 'token_getSupportedTokens'.\n${err.stack}`);
		throw err;
	}
};

const getTotalSupply = async () => {
	try {
		return invokeEndpoint('token_getTotalSupply');
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getTotalSupply\'.');
		}
		logger.warn(`Error returned when invoking 'token_getTotalSupply'.\n${err.stack}`);
		throw err;
	}
};

const getTokenInitializationFees = async () => {
	try {
		const response = await invokeEndpoint('token_getInitializationFees');
		if (response.error) throw new Error(response.error);
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getTokenInitializationFees\'.');
		}
		logger.warn(`Error returned when invoking 'token_getInitializationFees'.\n${err.stack}`);
		throw err;
	}
};

const hasUserAccount = async ({ address, tokenID }) => {
	try {
		return invokeEndpoint('token_hasUserAccount', { address, tokenID });
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'hasUserAccount\'.');
		}
		throw err;
	}
};

const hasEscrowAccount = async ({ tokenID, escrowChainID }) => {
	try {
		return invokeEndpoint('token_hasEscrowAccount', { tokenID, escrowChainID });
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'hasUserAccount\'.');
		}
		throw err;
	}
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
};
