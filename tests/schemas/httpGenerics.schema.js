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
import Joi from 'joi';

const goodRequestSchema = {
	data: Joi.array().single().required(),
	meta: Joi.object().required(),
	links: Joi.object().optional(),
};

const badRequestSchema = {
	error: Joi.boolean().required(),
	message: Joi.string().required(),
};

const notFoundSchema = badRequestSchema;

const serviceUnavailableSchema = badRequestSchema;

const urlNotFoundSchema = badRequestSchema;

const wrongInputParamSchema = badRequestSchema;

module.exports = {
	...require('./generics.schema'),
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
	badRequestSchema: Joi.object(badRequestSchema).required(),
	notFoundSchema: Joi.object(notFoundSchema).required(),
	serviceUnavailableSchema: Joi.object(serviceUnavailableSchema).required(),
	urlNotFoundSchema: Joi.object(urlNotFoundSchema).required(),
	wrongInputParamSchema: Joi.object(wrongInputParamSchema).required(),
};
