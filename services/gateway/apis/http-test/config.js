/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const path = require('path');

module.exports = {
	apiType: 'swagger2',
	swagger: {
		appRoot: __dirname,
		swaggerFile: path.resolve(__dirname, './swagger/test.yaml'),
		configDir: path.resolve(__dirname, '../../swagger'),
	},
};
