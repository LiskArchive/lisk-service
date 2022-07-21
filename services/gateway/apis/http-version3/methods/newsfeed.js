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
const newsfeedSource = require('../../../sources/version3/newsfeed');
const envelope = require('../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../shared/regex');
const { transformParams, response, getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/newsfeed',
	rpcMethod: 'get.newsfeed',
	tags: ['Newsfeed'],
	params: {
		source: { optional: true, type: 'string', min: 1, pattern: regex.NEWSFEED_SOURCE },
		limit: { optional: true, type: 'number', min: 1, max: 100, default: 10 },
		offset: { optional: true, type: 'number', min: 0, default: 0 },
	},
	get schema() {
		const newsfeedSchema = {};
		newsfeedSchema[this.swaggerApiPath] = { get: {} };
		newsfeedSchema[this.swaggerApiPath].get.tags = this.tags;
		newsfeedSchema[this.swaggerApiPath].get.parameters = transformParams(
			'newsfeed',
			this.params,
		);
		newsfeedSchema[this.swaggerApiPath].get.summary = 'Requests news/blog posts';
		newsfeedSchema[this.swaggerApiPath].get.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns news/blog posts',
		});
		newsfeedSchema[this.swaggerApiPath].get.responses = {
			200: {
				description: 'array of newsfeed articles',
				schema: {
					$ref: '#/definitions/NewsfeedWithEnvelope',
				},
			},
		};
		Object.assign(newsfeedSchema[this.swaggerApiPath].get.responses, response);
		return newsfeedSchema;
	},
	source: newsfeedSource,
	envelope,
};
