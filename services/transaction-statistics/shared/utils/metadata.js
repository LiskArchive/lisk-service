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

const { HTTP: { request } } = require('lisk-service-framework');

const { DB_CONSTANT } = require('./constants');
const { requestAppRegistry } = require('./request');
const config = require('../../config');

// TODO: Resolve network from network status response once available
const getTokenMetadataByID = async (tokenID) => {
	const network = 'mainnet';
	try {
		const tokenMetadata = await requestAppRegistry(
			'blockchain.apps.meta.tokens',
			{ tokenID, network },
		);
		return tokenMetadata;
	} catch (error) {
		// TODO: Refactor code once chainID is available in network status response
		const { serviceURL } = config.networks.find(e => e.name === network);
		const tokensMetadataURL = `${serviceURL}/api/v3/blockchain/apps/meta/tokens`;
		const tokenMetadata = await request(tokensMetadataURL, { tokenID, network });
		return tokenMetadata;
	}
};

const getTokensMetaInfo = async (tokenIDs) => {
	const tokensMetaInfo = {};
	await BluebirdPromise.map(
		tokenIDs,
		async tokenID => {
			if (tokenID !== DB_CONSTANT.UNAVAILABLE) {
				const response = await getTokenMetadataByID(tokenID);
				if (response && response.data) {
					const [tokenMetadata] = response.data.data;
					tokensMetaInfo[tokenID] = {
						tokenName: tokenMetadata.tokenName,
						symbol: tokenMetadata.symbol,
						logo: tokenMetadata.logo,
					};
				}
			}
		},
		{ concurrency: tokenIDs.length },
	);

	return tokensMetaInfo;
};

module.exports = {
	getTokensMetaInfo,
};
