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

let supportedCollectionIDInfo;

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

// TODO: Remove lint suppression once sdk endpoint is available:
// eslint-disable-next-line no-unused-vars
const updateCollectionIds = async (params) => {
	try {
		if (!supportedCollectionIDInfo) {
			// TODO: Invoke sdk endpoint once available
			// moduleConstants = await invokeEndpoint('nft_getCollectionIDs',{ chainID: params.chainID });
			supportedCollectionIDInfo = { collectionIDs: ['*'] };
		}
		return supportedCollectionIDInfo;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getCollectionIDs\'.');
		}
		logger.warn(`Error returned when invoking 'nft_getCollectionIDs'.\n${err.stack}`);
		throw err;
	}
};

const getCollectionIDs = async (params) => {
	if (!supportedCollectionIDInfo) {
		await updateCollectionIds(params);
	}
	return supportedCollectionIDInfo;
};

module.exports = {
	getNFTConstants,
	getCollectionIDs,
	updateCollectionIds,
};
