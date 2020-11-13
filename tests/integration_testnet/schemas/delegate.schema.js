/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
import Joi from 'joi';

const delegateSchema = {
	address: Joi.string().required(),
	approval: Joi.string().required(),
	missedBlocks: Joi.number().required(),
	producedBlocks: Joi.number().required(),
	productivity: Joi.string().required(),
	publicKey: Joi.string().required(),
	secondPublicKey: Joi.string().required(),
	rank: Joi.number().required(),
	rewards: Joi.string().required(),
	username: Joi.string().required(),
	vote: Joi.string().required(),
};

module.exports = {
	delegateSchema: Joi.object(delegateSchema),
};
