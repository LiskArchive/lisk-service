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
import regex from './regex';

const networks = {
	chainID: Joi.number().integer().min(1).required(),
	network: Joi.string().required(),
};

const blockchainAppMetaListSchema = {
	name: Joi.string().pattern(regex.NAME).required(),
	networks: Joi.array().items(networks).required(),
};

module.exports = {
	blockchainAppMetaListSchema: Joi.object(blockchainAppMetaListSchema).required(),
};
