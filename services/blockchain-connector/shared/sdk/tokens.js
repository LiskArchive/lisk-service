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
const { Exceptions: { TimeoutException } } = require('lisk-service-framework');
const { timeoutMessage, invokeEndpoint } = require('./client');

const getTokenBalances = async (address) => {
	try {
		const balances = await invokeEndpoint('token_getBalances', { address });
		return balances;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getTokenBalances\'.');
		}
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
		throw err;
	}
};

const getEscrowedAmounts = async () => {
	try {
		return invokeEndpoint('token_getEscrowedAmounts');
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getEscrowedAmounts\'.');
		}
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
		throw err;
	}
};

module.exports = {
	getTokenBalance,
	getTokenBalances,
	getEscrowedAmounts,
	getSupportedTokens,
	getTotalSupply,
};
