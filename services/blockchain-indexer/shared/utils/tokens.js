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
	Exceptions: {
		ValidationException,
	},
} = require('lisk-service-framework');

const { requestConnector, requestAppRegistry } = require('./request');
const regex = require('./regex');

const config = require('../../config');

const getTokenMetadataByID = async (tokenID) => {
	if (!tokenID.match(regex.TOKEN_ID)) throw new ValidationException('Invalid TokenID');

	const { chainID } = await requestConnector('getNetworkStatus');
	const [{ name: network } = {}] = config.networks.filter(item => item.chainID === chainID);

	const params = { chainID, tokenID };
	if (network) params.network = network;

	const tokenMetadata = await requestAppRegistry('blockchain.apps.meta.tokens', params);
	return tokenMetadata;
};

const populateTokenMetaInfo = async (items) => {
	const response = await BluebirdPromise.map(
		items,
		async (item) => {
			const { tokenID } = item;
			const tokenMetadataResponse = await getTokenMetadataByID(tokenID);
			const [tokenMetadata = {}] = tokenMetadataResponse.data || [];

			return {
				...item,
				name: tokenMetadata.tokenName,
				symbol: tokenMetadata.symbol,
			};
		},
		{ concurrency: items.length },
	);

	return response;
};

module.exports = {
	populateTokenMetaInfo,
};
