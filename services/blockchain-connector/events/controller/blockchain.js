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
const Signals = require('../../shared/signals');

const {
	decodeAccount,
	decodeBlock,
	decodeTransaction,
} = require('../../shared/sdk/decoder');

const { parseToJSONCompatObj } = require('../../shared/parser');

const decodeBlockEventPayload = async (payload) => parseToJSONCompatObj({
	block: { ...(await decodeBlock(payload.block)), _raw: payload.block },
	accounts: await Promise.all(
		payload.accounts.map(async a => ({ ...(await decodeAccount(a)), _raw: a })),
	),
});

const appReadyController = async (cb) => {
	const appReadyListener = async (payload) => cb(payload);
	Signals.get('appReady').add(appReadyListener);
};

const appShutdownController = async (cb) => {
	const appShutdownListener = async (payload) => cb(payload);
	Signals.get('appShutdown').add(appShutdownListener);
};

const appNetworkReadyController = async (cb) => {
	const appNetworkReadyListener = async (payload) => cb(payload);
	Signals.get('appNetworkReady').add(appNetworkReadyListener);
};

const appNetworkEventController = async (cb) => {
	const appNetworkEventListener = async (payload) => cb(payload);
	Signals.get('appNetworkEvent').add(appNetworkEventListener);
};

const appTransactionNewController = async (cb) => {
	const appTransactionNewListener = async (payload) => {
		const decodedPayload = { transaction: await decodeTransaction(payload) };
		cb(decodedPayload);
	};
	Signals.get('appTransactionNew').add(appTransactionNewListener);
};

const appChainForkController = async (cb) => {
	const appChainForkListener = async (payload) => {
		const decodedPayload = await decodeBlockEventPayload(payload);
		cb(decodedPayload);
	};
	Signals.get('appChainFork').add(appChainForkListener);
};

const appChainValidatorsChangeController = async (cb) => {
	const appChainValidatorsChangeListener = async (payload) => cb(payload);
	Signals.get('appChainValidatorsChange').add(appChainValidatorsChangeListener);
};

const appBlockNewController = async (cb) => {
	const appBlockNewListener = async (payload) => {
		const decodedPayload = await decodeBlockEventPayload(payload);
		cb(decodedPayload);
	};
	Signals.get('appBlockNew').add(appBlockNewListener);
};

const appBlockDeleteController = async (cb) => {
	const appBlockDeleteListener = async (payload) => {
		const decodedPayload = await decodeBlockEventPayload(payload);
		cb(decodedPayload);
	};
	Signals.get('appBlockDelete').add(appBlockDeleteListener);
};

module.exports = {
	appReadyController,
	appShutdownController,
	appNetworkReadyController,
	appNetworkEventController,
	appTransactionNewController,
	appChainForkController,
	appChainValidatorsChangeController,
	appBlockNewController,
	appBlockDeleteController,
};
