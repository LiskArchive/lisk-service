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

const { jsonRPCSchema } = require('../rpcGenerics.schema');
const regex = require('./regex');

const allowedPeerStateNames = ['connected', 'disconnected', 'any'];

const locationSchema = {
	countryCode: Joi.string().length(2).optional(),
	latitude: Joi.string().pattern(/^[0-9.-]+$/).optional(),
	longitude: Joi.string().pattern(/^[0-9.-]+$/).optional(),
};

const networkPeerSchema = {
	ip: Joi.string().ip({ version: 'ipv4', cidr: 'forbidden' }).required(),
	port: Joi.number().port().optional(),
	networkVersion: Joi.string().required(),
	state: Joi.string().valid(...allowedPeerStateNames).required(),
	height: Joi.number().positive().optional(),
	chainID: Joi.string().pattern(regex.CHAIN_ID).required(),
	location: Joi.object(locationSchema).optional(),
};

const emptyResultEnvelopeSchema = {
	data: Joi.array().length(0).required(),
	meta: Joi.object().required(),
	links: Joi.object().optional(),
};

const emptyResponseSchema = {
	jsonrpc: jsonRPCSchema,
	result: emptyResultEnvelopeSchema,
	id: Joi.alternatives(Joi.number(), Joi.string(), null).required(),
};

module.exports = {
	networkPeerSchema: Joi.object(networkPeerSchema),
	emptyResultEnvelopeSchema: Joi.object(emptyResultEnvelopeSchema).required(),
	emptyResponseSchema: Joi.object(emptyResponseSchema).required(),
};
