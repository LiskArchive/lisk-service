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
const { Exceptions: { TimeoutException }, Logger } = require('lisk-service-framework');
const { timeoutMessage } = require('./client');

const logger = Logger();

let moduleConstants;

let supportedNFTsInfo;

const getNFTConstants = async () => {
	try {
		if (!moduleConstants) {
			// TODO: Fetch feeCreateNFT directly from node when implemented
			// moduleConstants = await invokeEndpoint('nft_getConstants');
			moduleConstants = { feeCreateNFT: 5000000 };
		}
		return moduleConstants;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getConstants\'.');
		}
		logger.warn(`Error returned when invoking 'nft_getConstants'.\n${err.stack}`);
		throw err;
	}
};

const getSupportedNFTs = async () => {
	try {
		if (!supportedNFTsInfo) {
			// TODO: Invoke SDK endpoint once available
			// moduleConstants = await invokeEndpoint('nft_getSupportedNFTs');
			supportedNFTsInfo = ['00000000********', '00000001********', '0000000210000000', '0000000220000000'];
		}

		return supportedNFTsInfo;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getSupportedNFTs\'.');
		}
		logger.warn(`Error returned when invoking 'nft_getSupportedNFTs'.\n${err.stack}`);
		throw err;
	}
};

module.exports = {
	getNFTConstants,
	getSupportedNFTs,
};
