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
import Joi from 'joi';

const exportSchemaAccepted = {
	address: Joi.string().required(),
	interval: Joi.string().required(),
	fileName: Joi.string().optional(),
	fileUrl: Joi.string().optional(),
};

const exportSchema = {
	address: Joi.string().required(),
	interval: Joi.string().required(),
	fileName: Joi.string().required(),
	fileUrl: Joi.string().required(),
};

const metaSchema = {
	ready: Joi.boolean().required(),
};

const goodRequestSchema = {
	data: Joi.object().required(),
	meta: Joi.object().required(),
	links: Joi.object().optional(),
};

module.exports = {
	metaSchema: Joi.object(metaSchema).required(),
	exportSchemaAccepted: Joi.object(exportSchemaAccepted).required(),
	exportSchema: Joi.object(exportSchema).required(),
	goodRequestSchema: Joi.object(goodRequestSchema).required(),
};
