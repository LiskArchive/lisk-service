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

const block = {
	id: Joi.string().required(),
	height: Joi.number().required(),
	timestamp: Joi.number().required(),
};

const asset = {
	moduleID: Joi.string().required(),
	data: Joi.object().required(), // TODO: Update data schema once confirmed from sdk
};

const blockAssetSchema = {
	block: Joi.object(block).required(),
	assets: Joi.array().items(asset).required(),
};

module.exports = {
	blockAssetSchema: Joi.object(blockAssetSchema),
};
