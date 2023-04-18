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
const validateBLSKeySources = require('../../../../../sources/version3/validatorValidateBLSKey');
const envelope = require('../../../../../sources/version3/mappings/stdEnvelope');
const regex = require('../../../../../shared/regex');
const { response, getSwaggerDescription } = require('../../../../../shared/utils');

module.exports = {
	version: '2.0',
	swaggerApiPath: '/validator/validate-bls-key',
	httpMethod: 'POST',
	rpcMethod: 'post.validator.validate-bls-key',
	tags: ['Validator'],
	params: {
		blsKey: { optional: false, type: 'string', pattern: regex.BLS_KEY },
		proofOfPossession: { optional: false, type: 'string', pattern: regex.PROOF_OF_POSSESSION },
	},
	get schema() {
		const validateBLSKeySchema = {};
		validateBLSKeySchema[this.swaggerApiPath] = { post: {} };
		validateBLSKeySchema[this.swaggerApiPath].post.tags = this.tags;
		validateBLSKeySchema[this.swaggerApiPath].post.summary = 'Validates a BLS key against its corresponding Proof of Possession.';
		validateBLSKeySchema[this.swaggerApiPath].post.description = getSwaggerDescription({
			rpcMethod: this.rpcMethod,
			description: 'Validates a BLS key against its corresponding Proof of Possession.',
		});
		validateBLSKeySchema[this.swaggerApiPath].post.parameters = [{ $ref: '#/parameters/validateBLSKeyParams' }];
		validateBLSKeySchema[this.swaggerApiPath].post.responses = {
			200: {
				description: 'Returns a boolean representing the validity of the supplied BLS key and Proof of Possession.',
				schema: {
					$ref: '#/definitions/blsKeyValidationWithEnvelope',
				},
			},
		};
		Object.assign(validateBLSKeySchema[this.swaggerApiPath].post.responses, response);
		return validateBLSKeySchema;
	},
	source: validateBLSKeySources,
	envelope,
};
