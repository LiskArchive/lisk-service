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

const {
	pomHeightSchema,
	validDelegateStatuses,
} = require('./delegate.schema');

const delegateSchema = {
	approval: Joi.number().min(0).required(),
	missedBlocks: Joi.number().integer().min(0).optional(),
	producedBlocks: Joi.number().integer().min(0).optional(),
	productivity: Joi.string().optional(),
	rank: Joi.number().integer().min(1).optional(),
	rewards: Joi.string().optional(),
	username: Joi.string().optional(),
	vote: Joi.string().optional(),
	isBanned: Joi.boolean().optional(),
	status: Joi.string().valid(...validDelegateStatuses).optional(),
	pomHeights: Joi.array().items(pomHeightSchema).optional(),
	lastForgedHeight: Joi.number().integer().min(0).optional(),
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
	isMandatory: Joi.boolean().optional(),
};

const multisignatureAccountSchema = {
	lifetime: Joi.number().optional(),
	minimalNumberAcccounts: Joi.number().optional(),
	numberOfReqSignatures: Joi.number().required(),
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

const unconfirmedMultisignatureMembershipSchema = multisignatureAccountMemberSchema;

const unlockingHeightSchema = pomHeightSchema;

const unlockingItemSchema = {
	amount: Joi.string().required(),
	height: Joi.object(unlockingHeightSchema).required(),
	delegateAddress: Joi.string().required(),
};

const accountSchema = {
	address: Joi.string().required(),
	publicKey: Joi.string().required(),
	secondPublicKey: Joi.string().allow('').optional(),
	balance: Joi.string().required(),
	nonce: Joi.string().optional(),
	delegate: Joi.object(delegateSchema).optional(),
	knowledge: Joi.object(knowledgeSchema).optional(),
	multisignatureAccount: Joi.object(multisignatureAccountSchema).optional(),
	multisignatureMemberships: Joi.array()
		.items(multisignatureMembershipSchema).optional(),
	transactionCount: Joi.object(transactionCountSchema).required(),
	unconfirmedMultisignatureMemberships: Joi.array()
		.items(unconfirmedMultisignatureMembershipSchema).optional(), // TODO: Removed?
	unlocking: Joi.array().items(unlockingItemSchema).optional(),
};

module.exports = {
	accountSchema: Joi.object(accountSchema).required(),
	delegateSchema: Joi.object(delegateSchema).required(),
};
