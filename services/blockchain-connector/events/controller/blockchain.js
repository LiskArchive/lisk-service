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

const txpoolNewTransactionController = async (cb) => {
	const txpoolNewTransactionListener = async (payload) => cb(payload);
	Signals.get('txpoolNewTransaction').add(txpoolNewTransactionListener);
};

const chainForkedController = async (cb) => {
	const chainForkedListener = async (payload) => cb(payload);
	Signals.get('chainForked').add(chainForkedListener);
};

const chainValidatorsChangeController = async (cb) => {
	const chainValidatorsChangeListener = async (payload) => cb(payload);
	Signals.get('chainValidatorsChanged').add(chainValidatorsChangeListener);
};

const chainNewBlockController = async (cb) => {
	const chainNewBlockListener = async (payload) => cb(payload);
	Signals.get('chainNewBlock').add(chainNewBlockListener);
};

const chainDeleteBlockController = async (cb) => {
	const chainDeleteBlockListener = async (payload) => cb(payload);
	Signals.get('chainDeleteBlock').add(chainDeleteBlockListener);
};

module.exports = {
	appReadyController,
	appShutdownController,
	appNetworkReadyController,
	appNetworkEventController,
	txpoolNewTransactionController,
	chainForkedController,
	chainValidatorsChangeController,
	chainNewBlockController,
	chainDeleteBlockController,
};
