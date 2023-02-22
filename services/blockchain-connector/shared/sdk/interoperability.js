/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
	Exceptions: { TimeoutException },
} = require('lisk-service-framework');

const { timeoutMessage, invokeEndpoint } = require('./client');

const logger = Logger();

const getChainAccount = async (params) => {
	try {
		const chainAccount = await invokeEndpoint('interoperability_getChainAccount', { chainID: params.chainID });
		return chainAccount;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getChainAccount\'.');
		}
		logger.warn(`Error returned when invoking 'interoperability_getChainAccount' with chainID: ${params.chainID}.\n${err.stack}`);
		throw err;
	}
};

module.exports = {
	getChainAccount,
};
