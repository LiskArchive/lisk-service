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
const { invokeEndpoint } = require('./client');
const { getNodeInfo } = require('./endpoints_1');

let isThisMainchain;
let mainchainID;
let registrationFee;

const getChainAccount = async chainID => {
	const chainAccount = await invokeEndpoint('interoperability_getChainAccount', { chainID });
	return chainAccount;
};

const getMainchainID = async () => {
	if (!mainchainID) {
		const { chainID } = await getNodeInfo();
		const response = await invokeEndpoint('interoperability_getMainchainID', { chainID });
		mainchainID =
			response.error && response.error.message.includes('not registered to bus')
				? chainID
				: response.mainchainID;
	}
	return mainchainID;
};

const isMainchain = async () => {
	if (typeof isThisMainchain !== 'boolean') {
		const { chainID } = await getNodeInfo();
		isThisMainchain = chainID === (await getMainchainID());
	}
	return isThisMainchain;
};

const getChannel = async chainID => {
	const channelInfo = await invokeEndpoint('interoperability_getChannel', { chainID });
	return channelInfo;
};

const getRegistrationFee = async () => {
	if (!registrationFee) {
		registrationFee = await invokeEndpoint('interoperability_getRegistrationFee');
	}
	return registrationFee;
};

module.exports = {
	getChainAccount,
	getMainchainID,
	isMainchain,
	getChannel,
	getRegistrationFee,
};
