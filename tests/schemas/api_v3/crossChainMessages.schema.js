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

const regex = require('./regex');

const getCurrentTime = () => Math.floor(Date.now() / 1000);

const block = {
	id: Joi.string().min(1).max(64).pattern(regex.HASH_SHA256)
		.required(),
	height: Joi.number().integer().min(1).required(),
	timestamp: Joi.number().integer().positive().max(getCurrentTime())
		.required(),
	transactionID: Joi.string().min(1).max(64).pattern(regex.HASH_SHA256)
		.required(),
};

const CCM_STATUS = [
	'ok',
	'module_not_supported',
	'ccm_not_supported',
	'channel_unavailable',
	'recovered',
];

const crossChainMessageSchema = {
	moduleCrossChainCommandID: Joi.string().required(),
	moduleCrossChainCommandName: Joi.string().required(),
	sendingChainID: Joi.string().required(),
	receivingChainID: Joi.string().required(),
	nonce: Joi.string().pattern(regex.NONCE).required(),
	fee: Joi.string().required(),
	status: Joi.string().valid(...CCM_STATUS).required(),
	params: Joi.object().required(),
	block: Joi.object(block).required(),
	ccms: Joi.array.items(Joi.string()).required(),
};

module.exports = {
	crossChainMessageSchema: Joi.object(crossChainMessageSchema),
};
