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

const peerSchema = Joi.object({
	ip: Joi.string().ip().required(),
	httpPort: Joi.number().port().optional(),
	wsPort: Joi.number().port().optional(),
	state: Joi.number().required(),
	version: Joi.string().required(),
	broadhash: Joi.string().optional(),
	height: Joi.number().optional(),
	nonce: Joi.string().optional(),
	os: Joi.string().optional(),
	location: Joi.object({
		countryCode: Joi.string().optional(),
		ip: Joi.string().ip().optional(),
		latitude: Joi.string().optional(),
		longitude: Joi.string().optional(),
	}).optional(),
}).required();

export default peerSchema;
