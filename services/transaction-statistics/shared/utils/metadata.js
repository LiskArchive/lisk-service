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
const BluebirdPromise = require('bluebird');

const { requestAppRegistry } = require('./request');

const getTokenMetadataByID = async (tokenID) => {
	const tokenMetadata = await requestAppRegistry('blockchain.apps.meta.tokens', { tokenID });
	return tokenMetadata;
};

const getTokensMetaInfo = async (tokenIDs) => {
	const tokensMetaInfo = await BluebirdPromise.map(
		tokenIDs,
		async tokenID => {
			const [tokenMetadata] = (await getTokenMetadataByID(tokenID)).data;
			return {
				tokenName: tokenMetadata.tokenName,
				tokenID,
				symbol: tokenMetadata.symbol,
				logo: tokenMetadata.logo,
			};
		},
		{ concurrency: tokenIDs.length },
	);

	return tokensMetaInfo;
};

module.exports = {
	getTokensMetaInfo,
};
