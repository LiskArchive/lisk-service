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
const { Logger } = require('lisk-service-framework');

const { invokeEndpoint } = require('./client');

const logger = Logger();

let feeTokenID;
let minFeePerByte;

const cacheFeeTokenID = async () => {
	logger.trace('Attempting to update feeTokenID.');
	const response = await invokeEndpoint('fee_getFeeTokenID');
	if (response.error) throw response.error;

	feeTokenID = response.tokenID;
	logger.info(`Updated feeTokenID to ${feeTokenID}.`);
};

const cacheMinFeePerByte = async () => {
	logger.trace('Attempting to update minFeePerByte.');
	const response = await invokeEndpoint('fee_getMinFeePerByte');
	if (response.error) throw response.error;

	minFeePerByte = response.minFeePerByte;
	logger.info(`Updated minFeePerByte to ${minFeePerByte}.`);
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
