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

const signatureItem = {
	publicKey: Joi.string().pattern(/^([A-Fa-f0-9]{2}){32}$/).required(),
	signature: Joi.string().pattern(/^([A-Fa-f0-9]{2}){64}$/).required(),
};

const multisigTransactionSchema = {
	serviceId: Joi.string().required(),
	nonce: Joi.number().required(),
	senderPublicKey: Joi.string().pattern(/^([A-Fa-f0-9]{2}){32}$/).required(),
	asset: Joi.object().required(),
	moduleAssetId: Joi.string().required(),
	fee: Joi.string().required(),
	signatures: Joi.array().items(signatureItem).optional(),
	expires: Joi.number().integer().positive().required(),
	rejected: Joi.boolean().required(),
};

module.exports = {
	multisigTransactionSchema: Joi.object(multisigTransactionSchema).required(),
};
