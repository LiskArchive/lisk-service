/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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

const validDelegateStatuses = ['active', 'standby', 'banned', 'punished', 'non-eligible'];

const pomHeightSchema = {
	start: Joi.number().required(),
	end: Joi.number().required(),
};

const delegateSchema = {
	producedBlocks: Joi.number().integer().min(0).optional(),
	rank: Joi.number().integer().min(1).optional(),
	rewards: Joi.string().optional(),
	username: Joi.string().allow('').optional(),
	voteWeight: Joi.string().optional(),
	isBanned: Joi.boolean().optional(),
	status: Joi.string().valid(...validDelegateStatuses).optional(),
	pomHeights: Joi.array().items(pomHeightSchema).optional(),
	registrationHeight: Joi.number().integer().min(0).optional(),
	lastForgedHeight: Joi.number().integer().min(0).allow(null)
		.optional(),
	consecutiveMissedBlocks: Joi.number().integer().optional(),
	totalVotesReceived: Joi.string().optional(),
};

const knowledgeSchema = {
	owner: Joi.string().required(),
	description: Joi.string().required(),
};

const unlockingHeightSchema = pomHeightSchema;

const unlockingItemSchema = {
	amount: Joi.string().required(),
	height: Joi.object(unlockingHeightSchema).required(),
	delegateAddress: Joi.string().required(),
};

const summary = {
	address: Joi.string().required(),
	legacyAddress: Joi.string().optional(),
	balance: Joi.string().required(),
	username: Joi.string().allow('').optional(),
	publicKey: Joi.string().allow(null).required(),
	isMigrated: Joi.boolean().optional(),
	isDelegate: Joi.boolean().required(),
	isMultisignature: Joi.boolean().required(),
};

const sentVotes = {
	amount: Joi.number().required(),
	delegateAddress: Joi.string().required(),
};

const token = {
	balance: Joi.string().required(),
};

const sequence = {
	nonce: Joi.string().required(),
};

const dpos = {
	delegate: Joi.object(delegateSchema).required(),
	unlocking: Joi.array().items(unlockingItemSchema).optional(),
	sentVotes: Joi.array().items(sentVotes).optional(),
};

const keys = {
	numberOfSignatures: Joi.number().optional(),
	mandatoryKeys: Joi.array().optional(),
	optionalKeys: Joi.array().optional(),
	members: Joi.array().optional(),
	memberships: Joi.array().optional(),
};

const legacy = {
	address: Joi.string().required(),
	balance: Joi.string().required(),
};

const accountSchemaVersion5 = {
	summary: Joi.object(summary).required(),
	token: Joi.object(token).required(),
	sequence: Joi.object(sequence).required(),
	dpos: Joi.object(dpos).optional(),
	keys: Joi.object(keys).optional(),
	knowledge: Joi.object(knowledgeSchema).optional(),
	legacy: Joi.object(legacy).optional(),
};

module.exports = {
	accountSchemaVersion5: Joi.object(accountSchemaVersion5).required(),
	dpos: Joi.object(dpos).required(),
};
