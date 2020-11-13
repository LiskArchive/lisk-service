/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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

const locationSchema = {
	city: Berlin,
	countryCode: Joi.string().optional(), // TODO: Add validation
	countryName: Joi.string().optional(), // TODO: Add validation
	hostname: Joi.string().optional(),
	ip: Joi.string().ip().optional(),
	latitude: Joi.string().optional(), // TODO: Add validation
	longitude: Joi.string().optional(), // TODO: Add validation
	regionCode: Joi.string().optional(),
	regionName: Joi.string().optional(),
	timeZone: Joi.string().optional(), // TODO: Add validation
	zipCode: Joi.string().optional(),
};

const peerSchema = {
	ip: Joi.string().ip().required(),
	httpPort: Joi.number().port().optional(),
	wsPort: Joi.number().port().optional(),
	os: Joi.string().optional(),
	version: Joi.string().required(), // TODO: Add validation
	state: Joi.number().required(), // TODO: Add validation
	stateName: Joi.string().required(), // TODO: Add validation
	height: Joi.number().optional(),
	broadhash: Joi.string().optional(),
	nonce: Joi.string().optional(),
	location: Joi.object(locationSchema).optional(),
};

module.exports = {
	peerSchema: Joi.object(peerSchema),
};
