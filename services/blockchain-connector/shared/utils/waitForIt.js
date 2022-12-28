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
const { Logger } = require('lisk-service-framework');

const logger = Logger();

const waitForIt = (fn, intervalMs = 1000) => new Promise((resolve) => {
	const checkIfReady = async (that) => {
		try {
			const result = await fn();
			clearInterval(that);
			if (result !== undefined) resolve(result);
		} catch (err) {
			logger.debug(`Waiting for ${intervalMs}ms ...`);
		}
	};
	const hInterval = setInterval(checkIfReady, intervalMs, this);
	checkIfReady(hInterval);
});

module.exports = waitForIt;
