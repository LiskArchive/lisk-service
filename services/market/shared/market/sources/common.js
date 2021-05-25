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
const moment = require('moment');

const validateEntries = (entries, allowRefreshAfter) => entries === null
	|| Array.isArray(entries) && entries
		.some(entry => entry.updateTimestamp <= moment().subtract(allowRefreshAfter).unix());

module.exports = {
	validateEntries,
};
