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

const networkStatisticsSchema = Joi.object({
	basic: Joi.object({
		totalPeers: Joi.number().required(),
		connectedPeers: Joi.number().required(),
		disconnectedPeers: Joi.number().required(),
	}).required(),
	coreVer: Joi.object().required(),
	height: Joi.object().required(),
	os: Joi.object().required(),
}).required();

export default networkStatisticsSchema;
