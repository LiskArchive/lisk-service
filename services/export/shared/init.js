/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
const logger = require('lisk-service-framework').Logger();

const { getCurrentChainID } = require('./helpers');

const init = async () => {
	try {
		await getCurrentChainID();
	} catch (error) {
		const errorMsg = Array.isArray(error)
			? error.map(e => e.message).join('\n')
			: error.message;
		logger.error(`Unable to initialize node information due to: ${errorMsg}`);
	}
};

module.exports = {
	init,
};
