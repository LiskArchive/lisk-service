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
import regex from './regex';

const nftDetail = {
	chainID: Joi.string().pattern(regex.CHAIN_ID).required(),
	collectionID: Joi.string().pattern(regex.NFT_COLLECTION_ID).required(),
	index: Joi.number().integer().min(0).required(),
};

const nftAttribute = {
	module: Joi.string().pattern(regex.MODULE).required(),
	attribute: Joi.string().required(),
};

const nftSchema = {
	id: Joi.string().pattern(regex.NFT_ID).required(),
	nft: Joi.object(nftDetail).required(),
	owner: Joi.string().pattern(regex.NFT_OWNER).required(),
	attributes: Joi.array().items(nftAttribute).required(),
	lockingModule: Joi.string().pattern(regex.MODULE).optional(),
	escrowedChainID: Joi.string().pattern(regex.CHAIN_ID).optional(),
};

module.exports = {
	nftSchema: Joi.object(nftSchema).required(),
};
