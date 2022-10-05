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
import Joi from 'joi';
import regex from './regex';

const account = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).required(),
	name: Joi.string().pattern(regex.NAME).optional(),
};

const votes = {
	delegateAddress: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	name: Joi.string().pattern(regex.NAME).optional(),
	amount: Joi.string().required(),
};

const voterSchema = {
	account: Joi.object(account).required(),
	votes: Joi.array().items(votes).optional(),
};

module.exports = {
	voterSchema: Joi.object(voterSchema).required(),
};
