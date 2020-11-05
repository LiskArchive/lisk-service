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
const coreApi = require('./coreApi');

const getDelegates = async params => {
	const delegates = await coreApi.getDelegates(params);
	delegates.data.map(delegate => {
		delegate.isBanned = delegate.delegate.isBanned;
		delegate.status = delegate.delegate.status;
		delegate.pomHeights = delegate.delegate.pomHeights;
		delegate.lastForgedHeight = delegate.delegate.lastForgedHeight;
		delegate.consecutiveMissedBlocks = delegate.delegate.consecutiveMissedBlocks;
		return delegate;
	});
	return delegates;
};

module.exports = {
	getDelegates,
};
