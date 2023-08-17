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
const { getNodeInfo } = require('./endpoints_1');

const logger = Logger();

let mainchainID;
let registrationFee;

const getChainAccount = async (chainID) => {
	try {
		const chainAccount = await invokeEndpoint('interoperability_getChainAccount', { chainID });
		return chainAccount;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getChainAccount\'.');
		}
		logger.warn(`Error returned when invoking 'interoperability_getChainAccount' with chainID: ${chainID}.\n${err.stack}`);
		throw err;
	}
};

const getMainchainID = async () => {
	try {
		const { chainID } = await getNodeInfo();

		if (!mainchainID) {
			const response = await invokeEndpoint('interoperability_getMainchainID', { chainID });
			mainchainID = response.error && response.error.message.includes('not registered to bus')
				? chainID
				: response.mainchainID;
		}
		return mainchainID;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getMainchainID\'.');
		}
		logger.warn(`Error returned when invoking 'interoperability_getMainchainID'.\n${err.stack}`);
		throw err;
	}
};

const getChannel = async (chainID) => {
	try {
		const channelInfo = await invokeEndpoint('interoperability_getChannel', { chainID });
		return channelInfo;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getChannel\'.');
		}
		logger.warn(`Error returned when invoking 'interoperability_getChannel' with chainID: ${chainID}.\n${err.stack}`);
		throw err;
	}
};

const getRegistrationFee = async () => {
	try {
		if (!registrationFee) {
			registrationFee = await invokeEndpoint('interoperability_getRegistrationFee');
		}
		return registrationFee;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getRegistrationFee\'.');
		}
		logger.warn(`Error returned when invoking 'interoperability_getRegistrationFee'.\n${err.stack}`);
		throw err;
	}
};

module.exports = {
	getChainAccount,
	getMainchainID,
	getChannel,
	getRegistrationFee,
};
