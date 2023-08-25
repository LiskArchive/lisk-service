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
const { Exceptions: { TimeoutException }, Logger, Signals } = require('lisk-service-framework');
const { timeoutMessage } = require('./client');

const logger = Logger();

let moduleConstants;
let escrowedNFTs;
let supportedNFTsInfo;

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

const getNFTEscrowed = async (isForceUpdate = false) => {
	try {
		if (isForceUpdate || !escrowedNFTs) {
			// TODO: Fetch escrowed NFTs directly from node when implemented
			// escrowedNFTs = await invokeEndpoint('nft_getEscrowed');
			escrowedNFTs = [{
				escrowedChainID: '04000001',
				id: '0000000000000000000000000000000000',
				nft: {
					chainID: '00000000',
					collectionID: '10000000',
					index: 1,
				},
			}];
		}
		return escrowedNFTs;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getEscrowed\'.');
		}
		logger.warn(`Error returned when invoking 'nft_getEscrowed'.\n${err.stack}`);
		throw err;
	}
};

const getSupportedNFTs = async () => {
	try {
		if (!supportedNFTsInfo) {
			// TODO: Invoke SDK endpoint once available. related SDK issue: https://github.com/LiskHQ/lisk-sdk/issues/8886
			// supportedNFTsInfo = await invokeEndpoint('nft_getSupportedNFTs');
			supportedNFTsInfo = ['00000000********', '00000001********', '0000000210000000', '0000000220000000'];
		}

		return supportedNFTsInfo;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getSupportedNFTs\'.');
		}
		logger.warn(`Error returned when invoking 'nft_getSupportedNFTs'.\n${err.stack}`);
		throw err;
	}
};

const updateNFTInfo = async () => {
	const updateNFTInfoListener = async () => {
		try {
			await getNFTEscrowed(true);
		} catch (err) {
			logger.error(`Error occurred when caching NFT information:\n${err.stack}`);
		}
	};

	Signals.get('chain_newBlock').add(updateNFTInfoListener);
	Signals.get('chain_deleteBlock').add(updateNFTInfoListener);
};

module.exports = {
	getNFTConstants,
	getNFTEscrowed,
	getSupportedNFTs,
	updateNFTInfo,
};
