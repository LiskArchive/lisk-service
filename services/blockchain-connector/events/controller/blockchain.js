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
const { Signals } = require('lisk-service-framework');

const {
	decodeBlock,
	decodeTransaction,
} = require('../../shared/sdk/decoder');

const { parseToJSONCompatObj } = require('../../shared/parser');

const decodeBlockEventPayload = (payload) => parseToJSONCompatObj({
	block: { ...(decodeBlock(payload.block)), _raw: payload.block },
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

const appNewTransactionController = async (cb) => {
	const appNewTransactionListener = async (payload) => {
		const decodedPayload = { transaction: decodeTransaction(payload) };
		cb(decodedPayload);
	};
	Signals.get('txpool_newTransaction').add(appNewTransactionListener);
};

const appChainForkedController = async (cb) => {
	const appChainForkedListener = async (payload) => {
		const decodedPayload = await decodeBlockEventPayload(payload);
		cb(decodedPayload);
	};
	Signals.get('chain_forked').add(appChainForkedListener);
};

const appChainValidatorsChangeController = async (cb) => {
	const appChainValidatorsChangeListener = async (payload) => cb(payload);
	Signals.get('chain_validatorsChanged').add(appChainValidatorsChangeListener);
};

const appNewBlockController = async (cb) => {
	const appNewBlockListener = async (payload) => cb(payload);
	Signals.get('chain_newBlock').add(appNewBlockListener);
};

const appDeleteBlockController = async (cb) => {
	const appDeleteBlockListener = async (payload) => {
		const decodedPayload = decodeBlockEventPayload(payload);
		cb(decodedPayload);
	};
	Signals.get('chain_deleteBlock').add(appDeleteBlockListener);
};

module.exports = {
	appReadyController,
	appShutdownController,
	appNetworkReadyController,
	appNetworkEventController,
	appNewTransactionController,
	appChainForkedController,
	appChainValidatorsChangeController,
	appNewBlockController,
	appDeleteBlockController,
};
