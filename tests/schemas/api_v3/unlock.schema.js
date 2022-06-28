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

const unlocking = {
	delegateAddress: Joi.string().pattern(regex.ADDRESS_BASE32).required(),
	amount: Joi.string().min(10).required(),
	unvoteHeight: Joi.number().integer().min(1).required(),
};

const unlockSchema = {
	address: Joi.string().pattern(regex.ADDRESS_BASE32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).required(),
	name: Joi.string().pattern(regex.NAME).optional(),
	unlocking: Joi.array().items(unlocking).max(20).optional(),
};

module.exports = {
	unlockSchema: Joi.object(unlockSchema).required(),
};
