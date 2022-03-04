/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const core = require('./compat');
const Signals = require('../signals');

const {
	performLastBlockUpdate,
	getBlocks,
	deleteBlock,
	getTotalNumberOfBlocks,
} = require('./blocks');

const {
	reloadNextForgersCache,
	reloadDelegateCache,
	getNextForgers,
} = require('./delegates');

const {
	calculateEstimateFeeByteNormal,
	calculateEstimateFeeByteQuick,
} = require('./dynamicFees');

const config = require('../../config');

const logger = Logger();

const events = {
	newBlock: async (newBlock) => {
		try {
			logger.debug(`New block arrived: ${newBlock.id} at height ${newBlock.height}`);
			performLastBlockUpdate(newBlock);

			logger.debug(`============== Dispatching block to index: ${newBlock.id} at height ${newBlock.height} ==============`);
			let response;
			try {
				response = await getBlocks({ height: newBlock.height });
			} catch (_) {
				response = {
					data: [newBlock],
					meta: { count: 1, offset: 0, total: await getTotalNumberOfBlocks() },
				};
			}

			logger.debug(`============== 'newBlock' signal: ${Signals.get('newBlock')} ==============`);
			Signals.get('newBlock').dispatch(response);
		} catch (err) {
			logger.error(`Error occured when processing 'newBlock' event:\n${err.stack}`);
		}
	},
	updateAccountsByAddress: async (addresses) => {
		try {
			logger.debug(`============== 'updateAccountsByAddress' signal: ${Signals.get('updateAccountsByAddress')} ==============`);
			Signals.get('updateAccountsByAddress').dispatch(addresses);
		} catch (err) {
			logger.error(`Error occured when processing 'newBlock' event:\n${err.stack}`);
		}
	},
	deleteBlock: async (block) => {
		try {
			await deleteBlock(block);
			logger.debug(`============== 'deleteBlock' signal: ${Signals.get('deleteBlock')} ==============`);
			Signals.get('deleteBlock').dispatch({ data: [block] });
		} catch (err) {
			logger.error(`Error occured when processing 'deleteBlock' event:\n${err.stack}`);
		}
	},
	newRound: async () => {
		try {
			await reloadDelegateCache();
			await reloadNextForgersCache();
			const limit = core.getSDKVersion() >= 4 ? 103 : 101;
			const nextForgers = await getNextForgers({ limit, offset: 0 });
			const response = { nextForgers: nextForgers.data.map(forger => forger.address) };
			logger.debug(`============== 'newRound' signal: ${Signals.get('newRound')} ==============`);
			Signals.get('newRound').dispatch(response);
		} catch (err) {
			logger.error(`Error occured when processing 'newRound' event:\n${err.stack}`);
		}
	},
	calculateFeeEstimate: async () => {
		if (core.getSDKVersion() >= 4) {
			try {
				if (config.feeEstimates.fullAlgorithmEnabled) {
					logger.debug('Initiate the dynamic fee estimates computation (full computation)');
					calculateEstimateFeeByteNormal();
				}
				if (config.feeEstimates.quickAlgorithmEnabled) {
					logger.debug('Initiate the dynamic fee estimates computation (quick algorithm)');
					const feeEstimate = await calculateEstimateFeeByteQuick();

					// TODO: Make a better control over the estimate process
					logger.debug(`============== 'newFeeEstimate' signal: ${Signals.get('newFeeEstimate')} ==============`);
					Signals.get('newFeeEstimate').dispatch(feeEstimate);
				}
			} catch (err) {
				logger.error(`Error occured when processing 'calculateFeeEstimate' event:\n${err.stack}`);
			}
		}
	},
};

const init = () => {
	core.events.register(events);
	Object.keys(events).forEach((eventName) => Signals.get(eventName));
};

init();

// Re-subscribe to the events whenever a new client is instantiated
Signals.get('newApiClient').add(init);

module.exports = { init };
