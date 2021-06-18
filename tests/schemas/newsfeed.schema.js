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

const newsfeedSchema = {
	author: Joi.string().required(),
	content: Joi.string().optional(),
	imageUrl: Joi.string().optional(),
	sourceName: Joi.string().required(),
	sourceId: Joi.string().required(),
	timestamp: Joi.number().integer().optional(),
	ctime: Joi.number().integer().required(),
	mtime: Joi.number().integer().required(),
	title: Joi.string().optional(),
	url: Joi.string().optional(),
	image_url: Joi.string().optional(),
};

module.exports = {
	newsfeedSchema: Joi.object(newsfeedSchema).required(),
};
