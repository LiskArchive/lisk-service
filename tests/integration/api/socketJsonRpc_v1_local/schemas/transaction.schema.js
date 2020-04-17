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

import Joi from '@hapi/joi';

const transactionSchema = Joi.object({
	amount: Joi.string().required(),
	asset: Joi.object().required(),
	blockId: Joi.string().required(),
	confirmations: Joi.number().required(),
	fee: Joi.string().required(),
	height: Joi.number().required(),
	id: Joi.string().required(),
	recipientId: Joi.string().allow('').required(),
	recipientPublicKey: Joi.string().allow('').required(),
	senderId: Joi.string().required(),
	senderPublicKey: Joi.string().required(),
	signature: Joi.string().required(),
	signatures: Joi.array().required(),
	timestamp: Joi.number().required(),
	type: Joi.number().required(),
	senderSecondPublicKey: Joi.string(),
}).required();

module.exports = transactionSchema;

