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

const networkSearchSchema = {
	broadhash: Joi.string().required(),
	height: Joi.number().required(),
	networkHeight: Joi.number().required(),
	epoch: Joi.string().required(),
	milestone: Joi.string().required(),
	nethash: Joi.string().required(),
	supply: Joi.string().required(),
	reward: Joi.string().required(),
	fees: Joi.object(feeSchema).required(),
};

// "results": [
// 	{
// 		"score": 0.82,
// 		"description": "genesis_10",
// 		"id": "1864409191503661202L",
// 		"type": "address"
// 	}
// ],

module.exports = {
	networkSearchSchema: Joi.object(networkSearchSchema),
}
