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
const APP_STATUS = {
	ACTIVE: 'active',
	REGISTERED: 'registered',
	TERMINATED: 'terminated',
};

// TODO: Update values from sdk once this is settled: https://github.com/LiskHQ/discussions/discussions/101
const CHAIN_STATUS = Object.freeze({
	0: 'registered',
	1: 'active',
	2: 'terminated',
});

module.exports = {
	APP_STATUS,
	CHAIN_STATUS,
};
