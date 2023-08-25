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
const { Logger } = require('lisk-service-framework');

const {
	LENGTH_CHAIN_ID,
	PATTERN_ANY_NFT_COLLECTION_ID,
	PATTERN_CHAIN_ANY_NFT_COLLECTION_ID,
} = require('../../../constants');
const { requestConnector } = require('../../../utils/request');

const logger = Logger();

let nftSupportedResponse;

const getSupportedNFTs = async () => {
	// Return response if already cached
	if (nftSupportedResponse) return nftSupportedResponse;

	nftSupportedResponse = {
		data: {
			isSupportAllNFTs: false,
			patternCollectionIDs: [],
			exactCollectionIDs: [],
		},
		meta: {},
	};

	try {
		const collectionIDs = await requestConnector('getSupportedNFTs');
		collectionIDs.forEach(
			collectionID => {
				if (collectionID === PATTERN_ANY_NFT_COLLECTION_ID) {
					nftSupportedResponse.data.isSupportAllNFTs = true;
				} else if (
					collectionID.substring(LENGTH_CHAIN_ID) === PATTERN_CHAIN_ANY_NFT_COLLECTION_ID
				) {
					nftSupportedResponse.data.patternCollectionIDs.push(collectionID);
				} else {
					nftSupportedResponse.data.exactCollectionIDs.push(collectionID);
				}
			},
		);

		return nftSupportedResponse;
	} catch (err) {
		const errMessage = `Unable to fetch the supported NFT information from connector due to: ${err.message}.`;
		logger.warn(errMessage);
		logger.trace(err.stack);
		throw new Error(errMessage);
	}
};

module.exports = {
	getSupportedNFTs,
};
