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
const {
	Exceptions: { TimeoutException },
	Logger,
} = require('lisk-service-framework');

const { timeoutMessage, invokeEndpoint } = require('./client');

const logger = Logger();

const validateBLSKey = async ({ blsKey, proofOfPossession }) => {
	try {
		const response = await invokeEndpoint('validators_validateBLSKey', { blsKey, proofOfPossession });
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			logger.warn(`Request timed out when calling 'validateBLSKey' with:\nblsKey: ${blsKey}\nproofOfPossession: ${proofOfPossession}`);
			throw new TimeoutException('Request timed out when calling \'validateBLSKey\'.');
		}
		throw err;
	}
};

const getValidator = async (address) => {
	try {
		const validatorInfo = await invokeEndpoint('validators_getValidator', { address });
		return validatorInfo;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getValidator\'.');
		}
		throw err;
	}
};

module.exports = {
	validateBLSKey,
	getValidator,
};
