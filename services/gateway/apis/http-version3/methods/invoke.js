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
const invokeEndpointSource = require('../../../sources/version3/invoke');
const { getSwaggerDescription } = require('../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/invoke',
	httpMethod: 'POST',
	rpcMethod: 'post.invoke',
	tags: ['Proxy'],
	params: {
		endpoint: { optional: false, type: 'string' },
		params: { optional: true, type: 'object' },
	},
	get schema() {
		const invokeEndpointSchema = {};
		invokeEndpointSchema[this.swaggerApiPath] = { post: {} };
		invokeEndpointSchema[this.swaggerApiPath].post.tags = this.tags;
		invokeEndpointSchema[this.swaggerApiPath].post.summary = 'Proxy request to directly invoke application endpoint';
		invokeEndpointSchema[this.swaggerApiPath].post.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Returns endpoint response from the blockchain application in its original form.',
		});
		invokeEndpointSchema[this.swaggerApiPath].post.parameters = [{ $ref: '#/parameters/invokeParams' }];
		invokeEndpointSchema[this.swaggerApiPath].post.responses = {
			200: {
				description: 'Returns endpoint response from the blockchain application in its original form.',
				schema: {
					$ref: '#/definitions/invokeWithEnvelope',
				},
			},
			400: {
				description: 'Bad request',
				schema: {
					$ref: '#/definitions/badRequest',
				},
			},
		};
		return invokeEndpointSchema;
	},
	source: invokeEndpointSource,
};
