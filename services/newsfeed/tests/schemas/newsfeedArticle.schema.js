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
const Joi = require('joi');

const newsfeedArticleSchema = {
	author: Joi.string().required(),
	content_t: Joi.string().required(),
	image_url: Joi.string().allow(null).required(),
	source: Joi.string().pattern(/^\b[a-z]+(?:_[a-z]+){1,2}\b$/).required(),
	source_id: Joi.string().required(),
	created_at: Joi.number().integer().positive().required(),
	modified_at: Joi.number().integer().positive().required(),
	title: Joi.string().allow('').required(),
	url: Joi.string().required(),
};

module.exports = {
	newsfeedArticleSchema: Joi.object(newsfeedArticleSchema).required(),
};
