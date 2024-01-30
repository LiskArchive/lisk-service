/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
	utils: { hash },
	address: { getLisk32AddressFromPublicKey: getLisk32AddressFromPublicKeyHelper },
	legacyAddress: { getFirstEightBytesReversed },
} = require('@liskhq/lisk-cryptography');

const { PUBLIC_KEY, ADDRESS_LISK32 } = require('../regex');
const { getTransactions } = require('./chain');
const { requestAllCustom } = require('./requestAll');
const { MODULE, MODULE_SUB_STORE } = require('./constants');
const { requestConnector, requestIndexer } = require('./request');

const logger = Logger();

let tokenModuleData;
let loadingAssets = false;

const validateLisk32Address = address =>
	typeof address === 'string' && ADDRESS_LISK32.test(address);

const validatePublicKey = publicKey => typeof publicKey === 'string' && PUBLIC_KEY.test(publicKey);

const getLisk32AddressFromPublicKey = publicKey =>
	getLisk32AddressFromPublicKeyHelper(Buffer.from(publicKey, 'hex'));

const getLegacyAddress = publicKey =>
	getFirstEightBytesReversed(hash(Buffer.from(publicKey, 'hex'))).toString('hex');

const getAddressFromParams = params =>
	params.address || getLisk32AddressFromPublicKey(params.publicKey);

const checkIfAccountExists = async address => {
	const response = await requestIndexer('token.account.exists', { address });
	const { isExists } = response.data;
	return isExists;
};

const checkIfAccountHasTransactions = async address => {
	const response = await getTransactions({ address, limit: 1 });
	return !!response.data.length;
};

const checkIfAccountIsValidator = async address => {
	const response = await requestIndexer('pos.validators', { address });
	return !!response.data.length;
};

const getTokenBalancesAtGenesis = async () => {
	if (!tokenModuleData && !loadingAssets) {
		loadingAssets = true; // loadingAssets avoids repeated invocations

		// Asynchronously fetch the token module genesis assets and cache locally
		logger.info('Attempting to fetch and cache the token module genesis assets.');
		requestConnector('getGenesisAssetsLength', {
			module: MODULE.TOKEN,
			subStore: MODULE_SUB_STORE.TOKEN.USER,
		})
			.then(async genesisBlockAssetsLength => {
				const totalUsers = genesisBlockAssetsLength[MODULE.TOKEN][MODULE_SUB_STORE.TOKEN.USER];

				const response = await requestAllCustom(
					requestConnector,
					'getGenesisAssetByModule',
					{ module: MODULE.TOKEN, subStore: MODULE_SUB_STORE.TOKEN.USER, limit: 1000 },
					totalUsers,
				);

				tokenModuleData = response[MODULE_SUB_STORE.TOKEN.USER];
				loadingAssets = false;
				logger.info('Successfully cached token module genesis assets.');
			})
			.catch(err => {
				logger.warn(
					`Failed to fetch token module genesis assets. Will retry later.\nError: ${err.message}`,
				);
				logger.debug(err.stack);

				loadingAssets = false;
			});
	}

	return tokenModuleData;
};

const getOpeningBalance = async address => {
	const balancesAtGenesis = await getTokenBalancesAtGenesis();
	const accountInfo = balancesAtGenesis
		? balancesAtGenesis.find(e => e.address === address)
		: await requestConnector('getTokenBalanceAtGenesis', { address });

	const openingBalance = accountInfo
		? { tokenID: accountInfo.tokenID, amount: accountInfo.availableBalance }
		: null;

	return openingBalance;
};

module.exports = {
	validateLisk32Address,
	validatePublicKey,
	getLisk32AddressFromPublicKey,
	getLegacyAddress,
	getAddressFromParams,
	checkIfAccountExists,
	checkIfAccountHasTransactions,
	checkIfAccountIsValidator,
	getTokenBalancesAtGenesis,
	getOpeningBalance,
};
