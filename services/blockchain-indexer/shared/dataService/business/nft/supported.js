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
const { requestConnector } = require('../../../utils/request');
const { getNetworkStatus } = require('../network');

const logger = Logger();

const PATTERN_SUPPORT_ALL_NFT_COLLECTIONS = '*';

const getNFTSupported = async () => {
	const nftSupportedResponse = {
		isSupportAllNFTs: false,
		exactCollectionIDs: [],
	};

	try {
		const { data: { chainID } } = await getNetworkStatus();

		const { collectionIDs } = await requestConnector('getCollectionIDs', { chainID });
		nftSupportedResponse.exactCollectionIDs = collectionIDs;
		nftSupportedResponse.isSupportAllNFTs = collectionIDs.some(
			collectionID => collectionID === PATTERN_SUPPORT_ALL_NFT_COLLECTIONS,
		);

		return {
			data: nftSupportedResponse,
			meta: {},
		};
	} catch (err) {
		const errMessage = `Unable to fetch the supported NFT information from connector due to: ${err.message}.`;
		logger.warn(errMessage);
		logger.trace(err.stack);
		throw new Error(errMessage);
	}
};

module.exports = {
	getNFTSupported,
};
