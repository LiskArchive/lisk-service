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

const { match } = require('moleculer').Utils;
const safeRegex = require('safe-regex');

const safeTestRegex = (regex, action) => {
	try {
		if (safeRegex(regex)) return regex.test(action);
	} finally {
		// eslint-disable-next-line no-unsafe-finally
		return false;
	}
};

// eslint-disable-next-line array-callback-return
const checkWhitelist = (action, whitelist) =>
	whitelist.some(mask => {
		if (typeof mask === 'string') {
			return match(action, mask);
		}
		if (mask instanceof RegExp) {
			return safeTestRegex(mask, action);
		}
		return false;
	});

module.exports = {
	checkWhitelist,

	// Testing
	safeTestRegex,
};
