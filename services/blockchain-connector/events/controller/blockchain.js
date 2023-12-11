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
const { Logger, Signals } = require('lisk-service-framework');
const { MODULE_NAME_POS } = require('../../shared/sdk/constants/names');

const { getBlockByID } = require('../../shared/sdk/endpoints');
const { formatBlock: formatBlockFromFormatter } = require('../../shared/sdk/formatter');

const EMPTY_TREE_ROOT_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const logger = Logger();

const appReadyController = async cb => {
	const appReadyListener = async payload => cb(payload);
	Signals.get('appReady').add(appReadyListener);
};

const appShutdownController = async cb => {
	const appShutdownListener = async payload => cb(payload);
	Signals.get('appShutdown').add(appShutdownListener);
};

const appNetworkReadyController = async cb => {
	const appNetworkReadyListener = async payload => cb(payload);
	Signals.get('appNetworkReady').add(appNetworkReadyListener);
};

const appNetworkEventController = async cb => {
	const appNetworkEventListener = async payload => cb(payload);
	Signals.get('appNetworkEvent').add(appNetworkEventListener);
};

const txpoolNewTransactionController = async cb => {
	const txpoolNewTransactionListener = async payload => cb(payload);
	Signals.get('txpoolNewTransaction').add(txpoolNewTransactionListener);
};

const chainForkedController = async cb => {
	const chainForkedListener = async payload => cb(payload);
	Signals.get('chainForked').add(chainForkedListener);
};

const chainValidatorsChangeController = async cb => {
	const chainValidatorsChangeListener = async payload => cb(payload);
	Signals.get('chainValidatorsChanged').add(chainValidatorsChangeListener);
};

const formatBlock = payload =>
	formatBlockFromFormatter({
		header: payload.blockHeader,
		assets: payload.assets || [],
		transactions: payload.transactions || [],
	});

const chainNewBlockController = async cb => {
	const chainNewBlockListener = async payload => {
		const { blockHeader } = payload;
		let transactions = [];
		let assets = [];

		if (
			blockHeader.transactionRoot !== EMPTY_TREE_ROOT_HASH ||
			blockHeader.assetRoot !== EMPTY_TREE_ROOT_HASH
		) {
			try {
				const block = await getBlockByID(blockHeader.id);
				transactions = block.transactions;
				assets = block.assets;
			} catch (err) {
				logger.warn(
					`Could not fetch block ${blockHeader.id} within chainNewBlockListener due to: ${err.message}`,
				);
				logger.debug(err.stack);
			}
		}

		cb(
			formatBlock({
				blockHeader,
				assets,
				transactions,
			}),
		);

		// Reload validators cache on pos module transactions
		if (transactions.some(t => t.module === MODULE_NAME_POS)) {
			Signals.get('reloadAllPosValidators').dispatch();
		}
	};
	Signals.get('chainNewBlock').add(chainNewBlockListener);
};

const chainDeleteBlockController = async cb => {
	const chainDeleteBlockListener = async payload => {
		cb(formatBlock(payload));
		Signals.get('reloadAllPosValidators').dispatch();
	};
	Signals.get('chainDeleteBlock').add(chainDeleteBlockListener);
};

const systemNodeInfoEventController = async cb => {
	const systemNodeInfoEventListener = async payload => cb(payload);
	Signals.get('systemNodeInfo').add(systemNodeInfoEventListener);
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
	systemNodeInfoEventController,
};
