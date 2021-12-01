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
	address: Joi.string().pattern(/^lsk[a-hjkm-z2-9]{38}$/).required(),
	publicKey: Joi.string().pattern(/^([A-Fa-f0-9]{2}){32}$/).optional(),
	interval: Joi.string().pattern(/^\b((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))(:((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31)))?\b$/).required(),
};

const exportSchema = {
	address: Joi.string().pattern(/^lsk[a-hjkm-z2-9]{38}$/).required(),
	publicKey: Joi.string().pattern(/^([A-Fa-f0-9]{2}){32}$/).optional(),
	interval: Joi.string().pattern(/^\b((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))(:((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31)))?\b$/).required(),
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
