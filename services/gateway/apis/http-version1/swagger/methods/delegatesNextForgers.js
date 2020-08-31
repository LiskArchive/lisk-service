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

const delegatesNextForgers = require('../../methods/delegatesNextForgers');
const { transformParams } = require('../utils');

const key = delegatesNextForgers.swaggerApiPath;
const delegateSchema = {};
delegateSchema[key] = { get: {} };
delegateSchema[key] = { get: { tags: ['Delegates'] } };
delegateSchema[key].get.parameters = transformParams('delegates', delegatesNextForgers.params);
delegateSchema[key].get.responses = {
	200: {
		description: 'array of next forgers',
		schema: {
			type: 'array',
			items: {
				$ref: '#/definitions/DelegatesWithEnvelope',
			},
		},
	},
	400: {
		description: 'bad input parameter',
	},
	404: {
		description: 'Not found',
	},
};
module.exports = delegateSchema;
