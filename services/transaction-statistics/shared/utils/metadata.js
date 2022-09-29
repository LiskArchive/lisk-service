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

const { HTTP: { request }, Logger } = require('lisk-service-framework');

const { DB_CONSTANT } = require('./constants');
const { requestAppRegistry } = require('./request');
const config = require('../../config');
const { requestConnector } = require('./request');

const logger = Logger();

const getTokenMetadataByID = async (tokenID) => {
	const { chainID } = await requestConnector('getNetworkStatus');
	const network = config.networks[chainID];

	if (typeof network === 'undefined') {
		logger.warn(`Invalid chainID returned by node. chainID:${chainID}`);
		return {};
	}

	const { networkName } = network;

	try {
		const tokenMetadata = await requestAppRegistry(
			'blockchain.apps.meta.tokens',
			{ tokenID, chainID, network: networkName },
		);
		return tokenMetadata;
	} catch (error) {
		const { serviceURL } = network;
		const tokensMetadataURL = `${serviceURL}/api/v3/blockchain/apps/meta/tokens`;
		const tokenMetadata = await request(tokensMetadataURL, { tokenID, chainID });
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
				if (response && response.data?.length) {
					const [tokenMetadata] = response.data;
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
