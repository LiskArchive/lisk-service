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

const blocks = require('../../methods/blocks');
const { transformParams } = require('../utils');

const key = blocks.swaggerApiPath;
const blockSchema = {};
blockSchema[key] = { get: {} };
blockSchema[key] = { get: { tags: ['Blocks'] } };
blockSchema[key].get.parameters = transformParams('blocks', blocks.params);
blockSchema[key].get.responses = {
	200: {
		description: 'array of blocks',
		schema: {
			type: 'array',
			items: {
				$ref: '#/definitions/BlocksWithEnvelope',
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
module.exports = blockSchema;
