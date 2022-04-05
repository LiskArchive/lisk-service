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
const Signal = require('signals');

const { Logger } = require('lisk-service-framework');

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

		add: (listener) => {
			const isListenerAdded = signal.has(listener, signal);
			if (!isListenerAdded) {
				logger.debug(`Adding listener: '${listener.name}' to signal: '${name}'`);
				const binding = signal.add(listener, signal);
				return binding;
			}
			return false;
		},

		remove: (listener) => {
			const removedListener = signal.remove(listener, signal);
			logger.debug(`Removed listener: '${removedListener.name}' from signal: '${name}'`);
			return removedListener;
		},

		toString: () => signal.toString(),
	};
};

module.exports = { register, get };
