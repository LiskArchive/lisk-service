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

let feeTokenID;
let minFeePerByte;

const cacheFeeTokenID = async () => {
	try {
		logger.trace('Attemping to update feeTokenID.');
		const response = await invokeEndpoint('fee_getFeeTokenID');
		if (response.error) throw response.error;

		feeTokenID = response;
		logger.info(`Updated feeTokenID to ${feeTokenID}.`);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'cacheFeeTokenID\'.');
		}
		throw err;
	}
};

const cacheMinFeePerByte = async () => {
	try {
		logger.trace('Attemping to update minFeePerByte.');
		const response = await invokeEndpoint('fee_getMinFeePerByte');
		if (response.error) throw response.error;

		minFeePerByte = response;
		logger.info(`Updated minFeePerByte to ${minFeePerByte}.`);
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'cacheMinFeePerByte\'.');
		}
		throw err;
	}
};

const cacheFeeConstants = async () => {
	try {
		if (minFeePerByte === undefined) await cacheMinFeePerByte();
		if (feeTokenID === undefined) await cacheFeeTokenID();
	} catch (err) {
		logger.warn(`Error occurred when calling 'cacheFeeConstants':\n${err.stack}`);
	}
};

const getFeeTokenID = () => feeTokenID;

const getMinFeePerByte = () => minFeePerByte;

module.exports = {
	cacheFeeConstants,

	getFeeTokenID,
	getMinFeePerByte,
};
