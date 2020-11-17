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

const { validDelegateStatuses } = require('./delegate.schema');

const pomHeightsSchema = {
	start: Joi.number().required,
	end: Joi.number().required,
};

const delegateSchema = {
	approval: Joi.number().required(),
	missedBlocks: Joi.number().required(),
	producedBlocks: Joi.number().required(),
	productivity: Joi.string().required(),
	rank: Joi.number().required(),
	rewards: Joi.string().required(),
	username: Joi.string().required(),
	vote: Joi.string().required(),
	isBanned: Joi.boolean().optional(),
	status: Joi.string().valid(...validDelegateStatuses).optional(), //TODO: Clarify
	pomHeights: Joi.array().items(pomHeightsSchema).optional(),
	lastForgedHeight: Joi.number().integer().optional(), // TODO: Clarify
	consecutiveMissedBlocks: Joi.number().integer().optional(),
};

const knowledgeSchema = {
	owner: Joi.string().required(),
	description: Joi.string().required(),
};

const multisignatureAccountMemberSchema = {
	address: Joi.string().required(),
	publicKey: Joi.string().required(),
	secondPublicKey: Joi.string().required(),
	balance: Joi.number().required(),
	unconfirmedSignature: Joi.number().required(),
	isMandatory: Joi.boolean().optional(), // TODO: required?
};

const multisignatureAccountSchema = {
	lifetime: Joi.number().required(),
	minimalNumberAcccounts: Joi.number().required(),
	numberOfReqSignatures: Joi.number().optional(),
	members: Joi.array().items(multisignatureAccountMemberSchema).required(),
};

const multisignatureMembershipSchema = {
	address: Joi.string().required(),
	balance: Joi.string().required(),
	lifetime: Joi.number().required(),
	minimalNumberAcccounts: Joi.number().required(),
	publicKey: Joi.string().required(),
	secondPublicKey: Joi.string().required(),
};

const transactionCountSchema = {
	incoming: Joi.string().required(),
	outgoing: Joi.string().required(),
};

const unconfirmedMultisignatureMembershipSchema = multisignatureAccountMemberSchema; //TODO: Removed?

const unlockingHeightSchema = pomHeightsSchema;

const unlockingItemSchema = {
	amount: Joi.string().required(),
	height: Joi.object(unlockingHeightSchema).required,
	delegateAddress: Joi.string().required(),
};

const accountSchema = {
	address: Joi.string().required(),
	publicKey: Joi.string().required(),
	secondPublicKey: Joi.string().allow('').required(),
	balance: Joi.string().required(),
	nonce: Joi.string().optional(),
	delegate: Joi.object(delegateSchema).optional(),
	knowledge: Joi.object(knowledgeSchema).optional(),
	multisignatureAccount: Joi.object(multisignatureAccountSchema).optional(),
	multisignatureMemberships: Joi.array()
		.items(multisignatureMembershipSchema).optional(),
	transactionCount: Joi.object(transactionCountSchema).required(),
	unconfirmedMultisignatureMemberships: Joi.array()
		.items(unconfirmedMultisignatureMembershipSchema).optional(), //TODO: Removed?
	unlocking: Joi.array().items(unlockingItemSchema).optional(),
};

module.exports = {
	accountSchema: Joi.object(accountSchema).required(),
	delegateSchema: Joi.object(delegateSchema).required(),
};
