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
const actions = require('../src/sdk_v5/actions');

const exportAllMethods = async () => {
	const registeredActions = await actions.getRegisteredActions();
	const allMethods = registeredActions.map(action => {
		const genericController = (regAction) => (params) => actions.invokeAction(regAction, params);
		const controller = genericController(action);
		return {
			name: action,
			description: `Action: ${action}`,
			controller,
			params: {
				action: { optional: true, type: 'any' },
				params: { optional: true, type: 'any' },
			},
		};
	});
	return allMethods;
};

module.exports = exportAllMethods();
