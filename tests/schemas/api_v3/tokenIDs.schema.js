/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const tokenIDsMetaSchema = {
	count: Joi.number().integer().min(0).required(),
	offset: Joi.number().integer().min(0).required(),
	total: Joi.number().integer().min(0).required(),
};

const tokenIDsSchema = {
	tokenIDs: Joi.array().required(),
};

const goodRequestSchemaFortokenIDs = {
	data: Joi.object(tokenIDsSchema).required(),
	meta: Joi.object().required(),
};

module.exports = {
	tokenIDsSchema: Joi.object(tokenIDsSchema).required(),
	tokenIDsMetaSchema: Joi.object(tokenIDsMetaSchema).required(),
	goodRequestSchemaFortokenIDs: Joi.object(goodRequestSchemaFortokenIDs).required(),
};
