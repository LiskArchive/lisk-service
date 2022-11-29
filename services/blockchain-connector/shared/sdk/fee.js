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
	Logger,
	Exceptions: { TimeoutException },
} = require('lisk-service-framework');

const { timeoutMessage, invokeEndpoint } = require('./client');

const logger = Logger();

let minFeePerByte;

const getFeeConstants = async () => {
	try {
		// TODO: Update endpoint when available from SDK
		const response = await invokeEndpoint('');
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getFeeConstants\'.');
		}
		throw err;
	}
};

const refreshMinFeePerByte = async () => {
	try {
		logger.trace('Attemping to update minFeePerByte.');
		const feeConstants = await getFeeConstants();
		minFeePerByte = feeConstants.minFeePerByte;
		logger.info(`Updated minFeePerByte to ${minFeePerByte}.`);
	} catch (err) {
		logger.warn(`Error occurred while refreshing refreshMinFeePerByte:\n${err.stack}`);
	}
};

const getMinFeePerByte = () => minFeePerByte;

module.exports = {
	getMinFeePerByte,
	refreshMinFeePerByte,
};
