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

const newsfeedArticleSchema = {
	author: Joi.string().required(),
	content: Joi.string().required(),
	imageUrl: Joi.string().allow(null).required(),
	image_url: Joi.string().allow(null).required(),
	source: Joi.string().pattern(/^\b[a-z]+(?:_[a-z]+){1,2}\b$/).required(),
	sourceId: Joi.string().required(),
	timestamp: Joi.number().integer().positive().required(),
	createdAt: Joi.number().integer().positive().required(),
	modifiedAt: Joi.number().integer().positive().required(),
	title: Joi.string().allow('', null).required(),
	url: Joi.string().required(),
};

const newsfeedMetaSchema = {
	count: Joi.number().integer().min(1).required(),
	total: Joi.number().integer().min(1).required(),
	offset: Joi.number().integer().min(0).required(),
};

module.exports = {
	newsfeedSchema: Joi.object(newsfeedArticleSchema).required(),
	newsfeedMetaSchema: Joi.object(newsfeedMetaSchema).required(),
};
