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
const { requestConnector } = require('../../../utils/request');

let moduleConstants;

const APP_STATUS = {
	ACTIVATED: 'activated',
	REGISTERED: 'registered',
	TERMINATED: 'terminated',
};

const CHAIN_STATUS = Object.freeze({
	0: 'registered',
	1: 'activated',
	2: 'terminated',
});

const getInteroperabilityConstants = async () => {
	if (typeof moduleConstants === 'undefined') {
		const registrationFee = await requestConnector('getChainRegistrationFee');

		moduleConstants = {
			chainRegistrationFee: registrationFee.fee,
		};
	}

	return {
		data: moduleConstants,
		meta: {},
	};
};

module.exports = {
	APP_STATUS,
	CHAIN_STATUS,
	getInteroperabilityConstants,
};
