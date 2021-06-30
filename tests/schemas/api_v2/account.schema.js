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

const {
	pomHeightSchema,
	validDelegateStatuses,
} = require('./delegate.schema');

const delegateSchema = {
	approval: Joi.number().min(0).optional(),
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
	registrationHeight: Joi.number().integer().min(0).optional(),
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
	secondPublicKey: Joi.string().optional(),
	balance: Joi.string().required(),
	unconfirmedSignature: Joi.number().optional(),
	isMandatory: Joi.boolean().optional(),
};

const multisignatureAccountSchema = {
	lifetime: Joi.number().optional(),
	minimalNumberAcccounts: Joi.number().optional(),
	numberOfReqSignatures: Joi.number().optional(),
	members: Joi.array().items(multisignatureAccountMemberSchema).optional(),
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
	publicKey: Joi.string().allow('').required(),
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
	approval: Joi.number().min(0).optional(),
	missedBlocks: Joi.number().integer().min(0).optional(),
	producedBlocks: Joi.number().integer().min(0).optional(),
	rank: Joi.number().integer().min(1).optional(),
	rewards: Joi.string().optional(),
	username: Joi.string().allow('').optional(),
	isBanned: Joi.boolean().optional(),
	status: Joi.string().valid(...validDelegateStatuses).optional(),
	pomHeights: Joi.array().items(pomHeightSchema).optional(),
	lastForgedHeight: Joi.number().integer().min(0).optional(),
	consecutiveMissedBlocks: Joi.number().integer().optional(),
	delegate: Joi.object().required(), // TODO delegate schema for version 5
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
	accountSchema: Joi.object(accountSchema).required(),
	delegateSchema: Joi.object(delegateSchema).required(),
	accountSchemaVersion5: Joi.object(accountSchemaVersion5).required(),
	dpos: Joi.object(dpos).required(),
};
