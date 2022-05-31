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
const Signal = require('signals');

const Logger = require('./logger').get;

const logger = Logger();

const signals = {};

const register = name => {
	signals[name] = new Signal();
	logger.debug(`Registered internal signal ${name}`);
	return signals[name];
};

const get = name => {
	const signal = signals[name] ? signals[name] : register(name);
	return {
		dispatch: signal.dispatch,

		add: listener => {
			const isListenerAdded = signal.has(listener, signal);
			if (!isListenerAdded) {
				logger.info(`Adding listener: '${listener.name}' to signal: '${name}'`);
				const binding = signal.add(listener, signal);
				return binding;
			}
			return false;
		},

		remove: listener => {
			const removedListener = signal.remove(listener, signal);
			logger.info(`Removed listener: '${removedListener.name}' from signal: '${name}'`);
			return removedListener;
		},

		getNumListeners: () => {
			const numOfListener = signal.getNumListeners(signal);
			logger.info(`Number of listener: '${numOfListener}' from signal: '${name}'`);
			return numOfListener;
		},

		dispose: () => {
			const disposedListener = signal.dispose(signal);
			logger.info(`Disposed listener: '${name}'`);
			return disposedListener;
		},

		removeAll: () => {
			const removedListener = signal.removeAll(signal);
			logger.info('Removed all listeners');
			return removedListener;
		},

		toString: () => signal.toString(),
	};
};

module.exports = { register, get };
