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
import regex from '../api_v3/regex';

const statusSchema = {
	build: Joi.string().required(),
	description: Joi.string().required(),
	name: Joi.string().required(),
	version: Joi.string().pattern(regex.SEMVER).required(),
	chainID: Joi.string().pattern(regex.CHAIN_ID).required(),
	networkNodeVersion: Joi.string().optional(),
};

module.exports = {
	statusSchema: Joi.object(statusSchema).required(),
};
