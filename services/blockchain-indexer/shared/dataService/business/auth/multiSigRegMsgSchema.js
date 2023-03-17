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
const { getRegisteredModules, MODULE } = require('../../../constants');
const { requestConnector } = require('../../../utils/request');

const getAuthMultiSigRegMsgSchema = async () => {
	const registeredModules = await getRegisteredModules();
	const isAuthModuleRegistered = registeredModules.includes(MODULE.AUTH);

	if (isAuthModuleRegistered) {
		const authMultiSigRegMsg = await requestConnector('getAuthMultiSigRegMsgSchema');
		return {
			moduleCommand: `${MODULE.AUTH}:registerMultisignature`,
			param: 'signatures',
			schema: authMultiSigRegMsg.schema,
		};
	}
	return null;
};

module.exports = {
	getAuthMultiSigRegMsgSchema,
};
