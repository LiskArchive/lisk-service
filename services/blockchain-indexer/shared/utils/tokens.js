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

const {
	HTTP: { request },
} = require('lisk-service-framework');

const { requestConnector, requestAppRegistry } = require('./request');

const config = require('../../config');

const resolveNetworkByChainID = (chainID) => {
	const chainIDPrefix = chainID.slice(0, 2);
	const network = config.CHAIN_ID_PREFIX_NETWORK_MAP[chainIDPrefix];
	return network;
};

const getTokenMetadataByID = async (tokenID) => {
	let tokenMetadata;
	// TODO: Resolve network directly from tokenID when SDK returns correct information
	const { chainID } = await requestConnector('getNetworkStatus');

	const params = {
		tokenID,
		chainID,
		network: resolveNetworkByChainID(chainID),
	};

	try {
		tokenMetadata = await requestAppRegistry('blockchain.apps.meta.tokens', params);
	} catch (err) {
		const { serviceURL } = config.networks.LISK.find(c => c.name === 'mainnet');
		tokenMetadata = await request(`${serviceURL}/api/v3/blockchain/apps/meta/tokens`, params);
	}

	return tokenMetadata;
};

const populateTokenMetaInfo = async (tokenInfoList) => {
	const response = await BluebirdPromise.map(
		tokenInfoList,
		async (tokenInfo) => {
			const { tokenID } = tokenInfo;
			// TODO: Optimize
			const tokenMetadataResponse = await getTokenMetadataByID(tokenID);
			const [tokenMetadata = {}] = tokenMetadataResponse.data || [];

			return {
				...tokenInfo,
				name: tokenMetadata.tokenName,
				symbol: tokenMetadata.symbol,
			};
		},
		{ concurrency: tokenInfoList.length },
	);

	return response;
};

module.exports = {
	populateTokenMetaInfo,
};
