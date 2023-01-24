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
const { getBlockchainAppsMetaList } = require('./metadata');

const status = {
	isReady: false,
};

const getStatus = async () => {
	if (!status.isReady) {
		const appMetaList = await getBlockchainAppsMetaList({ limit: 10, offset: 0 });
		status.isReady = !!appMetaList.data.length;
	}
	return status;
};

module.exports = {
	getStatus,
};
