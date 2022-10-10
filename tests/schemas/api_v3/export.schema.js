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

const exportSchemaAccepted = {
	address: Joi.string().pattern(regex.ADDRESS_LISK32).required(),
	publicKey: Joi.string().pattern(regex.PUBLIC_KEY).required(),
	interval: Joi.string().pattern(regex.INTERVAL).required(),
};

const exportSchema = {
	...exportSchemaAccepted,
	fileName: Joi.string().pattern(regex.FILE_NAME).required(),
	fileUrl: Joi.string().pattern(regex.FILE_URL).required(),
};

const metaSchemaForExport = {
	ready: Joi.boolean().required(),
};

const goodRequestSchemaForExport = {
	data: Joi.object().required(),
	meta: Joi.object(metaSchemaForExport).required(),
	links: Joi.object().optional(),
};

module.exports = {
	exportSchema: Joi.object(exportSchema).required(),
	exportSchemaAccepted: Joi.object(exportSchemaAccepted).required(),
	metaSchemaForExport: Joi.object(metaSchemaForExport).required(),
	goodRequestSchemaForExport: Joi.object(goodRequestSchemaForExport).required(),
};
