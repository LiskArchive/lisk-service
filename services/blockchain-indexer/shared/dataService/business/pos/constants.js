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
const { requestConnector } = require('../../../utils/request');

let moduleConstants;

const getPosConstants = async () => {
	if (typeof moduleConstants === 'undefined') moduleConstants = await requestConnector('getPosConstants');

	return {
		data: moduleConstants,
		meta: {},
	};
};

const getPosTokenID = async () => {
	const { data: { posTokenID } } = await getPosConstants();
	return posTokenID;
};

module.exports = {
	getPosConstants,
	getPosTokenID,
};
