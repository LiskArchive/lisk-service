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

const logger = Logger();

const waitForIt = (fn, intervalMs = 1000) => new Promise((resolve) => {
	let hInterval;
	const checkIfReady = async function () {
		try {
			const result = await fn();
			clearInterval(hInterval);
			resolve(result);
		} catch (err) {
			logger.debug(`Waiting ${intervalMs}...`);
		}
	};
	hInterval = setInterval(checkIfReady, intervalMs);
	checkIfReady();
});

module.exports = waitForIt;
