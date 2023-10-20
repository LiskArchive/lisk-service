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
	HTTP,
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const { getCurrentChainID, isMainchain } = require('./chain');
const regex = require('../../../regex');
const config = require('../../../../config');
const { LENGTH_CHAIN_ID, LENGTH_NETWORK_ID } = require('../../../constants');
const { requestConnector } = require('../../../utils/request');

const resolveMainchainServiceURL = async () => {
	if (config.endpoints.mainchainServiceUrl) return config.endpoints.mainchainServiceUrl;

	const chainID = await getCurrentChainID();
	const networkID = chainID.substring(0, LENGTH_NETWORK_ID);
	const mainchainID = networkID.padEnd(LENGTH_CHAIN_ID, '0');
	const [{ serviceURL } = {}] = config.networks.LISK
		.filter(networkInfo => networkInfo.chainID === mainchainID);
	return serviceURL;
};

const resolveChannelInfo = async (inputChainID) => {
	if (inputChainID === await getCurrentChainID()) {
		throw new ValidationException('Channel info cannot be determined when receivingChainID and currentChainID are same.');
	}

	try {
		if ((await isMainchain() && !regex.MAINCHAIN_ID.test(inputChainID))
			|| (!await isMainchain() && regex.MAINCHAIN_ID.test(inputChainID))) {
			const channelInfo = await requestConnector('getChannel', { chainID: inputChainID });
			return channelInfo;
		}

		// Redirect call to the mainchain service
		const serviceURL = await resolveMainchainServiceURL();
		const invokeEndpoint = `${serviceURL}/api/v3/invoke`;
		const { data: response } = await HTTP.post(
			invokeEndpoint,
			{
				endpoint: 'interoperability_getChannel',
				params: { chainID: inputChainID },
			},
		);

		if (response.error) {
			throw new ValidationException(`Channel info is not available for the chain: ${inputChainID}.`);
		}

		const { data: channelInfo } = response;
		return channelInfo;
	} catch (error) {
		throw new ValidationException(`Error while retrieving channel info for the chain: ${inputChainID}.\nError: ${error}`);
	}
};

module.exports = {
	resolveMainchainServiceURL,
	resolveChannelInfo,
};
