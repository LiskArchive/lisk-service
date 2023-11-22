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
const Logger = require('./logger').get;

const logger = Logger();

const waitForIt = (fn, intervalMs = 1000, resolveUndefined = false) =>
	// eslint-disable-next-line implicit-arrow-linebreak
	new Promise(resolve => {
		// eslint-disable-next-line consistent-return
		const timeout = setInterval(async () => {
			try {
				const result = await fn();
				if (resolveUndefined || result !== undefined) {
					clearInterval(timeout);
					return resolve(result);
				}
			} catch (err) {
				logger.debug(`Waiting ${intervalMs}...`);
			}
		}, intervalMs);
	});

module.exports = waitForIt;
