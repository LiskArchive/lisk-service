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

const regex = require('./regex');

const nftSupportedDataSchema = {
	isSupportAllNFTs: Joi.boolean().required(),
	exactCollectionIDs: Joi
		.array()
		.items(Joi.string().pattern(regex.NFT_SUPPORTED_COLLECTION_IDS).required())
		.min(0)
		.required(),
};

const nftSupportedMetaSchema = {};

const nftSupportedSchema = {
	data: Joi.object(nftSupportedDataSchema).required(),
	meta: Joi.object(nftSupportedMetaSchema).required(),
};

module.exports = {
	nftSupportedSchema: Joi.object(nftSupportedSchema).required(),
};
