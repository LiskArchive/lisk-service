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

const EMPTY_STRING = '';
const validStatuses = ['registered', 'active', 'terminated', 'unregistered'];

const logo = {
	png: Joi.string().required(),
	svg: Joi.string().allow(EMPTY_STRING).required(),
};

const serviceURL = {
	http: Joi.string().required(),
	ws: Joi.string().required(),
};

const explorer = {
	url: Joi.string().required(),
	txnPage: Joi.string().required(),
};

const appNode = {
	url: Joi.string().required(),
	maintainer: Joi.string().required(),
};

const blockchainAppMetadataSchema = {
	chainName: Joi.string().pattern(regex.NAME).required(),
	chainID: Joi.string().required(),
	status: Joi.string().valid(...validStatuses).required(),
	networkType: Joi.string().pattern(regex.NETWORK).required(),
	isDefault: Joi.boolean().required(),
	title: Joi.string().optional(),
	description: Joi.string().optional(),
	genesisURL: Joi.string().allow(EMPTY_STRING).required(),
	projectPage: Joi.string().required(),
	appPage: Joi.string().optional(),
	serviceURLs: Joi.array().items(serviceURL).required(),
	explorers: Joi.array().items(explorer).required(),
	logo: Joi.object(logo).required(),
	backgroundColor: Joi.string().required(),
	appNodes: Joi.array().items(appNode).optional(),
};

module.exports = {
	blockchainAppMetadataSchema: Joi.object(blockchainAppMetadataSchema).required(),
};
