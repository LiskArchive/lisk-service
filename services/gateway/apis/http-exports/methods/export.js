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
const exportTransactionsSource = require('../../../sources/version2/export');
const envelope = require('../../../sources/version2/mappings/stdEnvelope');
// const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/exports/:filename',
	params: {
		filename: { optional: false, type: 'string' },
	},
	tags: ['Transaction Export'],
	source: exportTransactionsSource,
	envelope,
};
