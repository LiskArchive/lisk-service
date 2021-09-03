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
const Joi = require('joi');

const asset = {
	numberOfSignatures: Joi.string().required(),
	mandatoryKeys: Joi.array().required(),
	optionalKeys: Joi.array().required(),
};

const transactionSchema = {
	serviceId: Joi.string().required(),
	nonce: Joi.string().required(),
	senderPublicKey: Joi.string().required(),
	asset: Joi.object(asset).required(),
	moduleAssetId: Joi.array().items(Joi.string().required()).required(),
	fee: Joi.string().required(),
	createdAt: Joi.number().integer().positive().required(),
	modifiedAt: Joi.number().integer().positive().required(),
	expiresAt: Joi.number().integer().positive().required(),
	rejected: Joi.boolean().required(),
};

module.exports = {
	transactionSchema: Joi.object(transactionSchema).required(),
};
