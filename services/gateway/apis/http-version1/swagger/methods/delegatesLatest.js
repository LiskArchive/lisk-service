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

const delegatesLatest = require('../../methods/delegatesLatest');
const { transformParams } = require('../utils');

const key = delegatesLatest.swaggerApiPath;
const delegatesSchema = {};
delegatesSchema[key] = { get: {} };
delegatesSchema[key] = { get: { tags: ['Delegates'] } };
delegatesSchema[key].get.parameters = transformParams('delegates', delegatesLatest.params);
delegatesSchema[key].get.responses = {
	200: {
		description: 'array of ecently registered delegates',
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
module.exports = delegatesSchema;
