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

const contact = {
	email: Joi.string().required(),
};

const license = {
	name: Joi.string().required(),
	url: Joi.string().required(),
};

const info = {
	title: Joi.string().required(),
	version: Joi.string().required(),
	contact: Joi.object(contact).required(),
	description: Joi.string().required(),
	license: Joi.object(license).required(),
};

const tag = {
	name: Joi.string().required(),
	description: Joi.string().required(),
};

const pathParameters = {
	$ref: Joi.string().optional(),
	name: Joi.string().optional(),
	in: Joi.string().optional(),
	description: Joi.string().optional(),
	required: Joi.boolean().optional(),
	type: Joi.string().optional(),
	enum: Joi.array().items(Joi.string().required()).optional(),
	default: Joi.string().optional(),
};

const responseSchema = {
	$ref: Joi.string().required(),
};

const pathResponses = {
	description: Joi.string().optional(),
	schema: Joi.object(responseSchema).optional(),
	$ref: Joi.string().optional(),
};

const responseKey = Joi.string().required();
const responseEntry = Joi.object(pathResponses).required();

const entries = {
	tags: Joi.array().items(Joi.string().required()).optional(),
	summary: Joi.string().required(),
	description: Joi.string().required(),
	parameters: Joi.array().items(pathParameters).optional(),
	responses: Joi.object().pattern(responseKey, responseEntry).required(),
};

const path = {
	get: Joi.object(entries).optional(),
	post: Joi.object(entries).optional(),
};

const pathKey = Joi.string().required();
const pathEntry = Joi.object(path).required();

const parameter = {
	name: Joi.string().optional(),
	in: Joi.string().optional(),
	description: Joi.string().optional(),
	required: Joi.boolean().optional(),
	type: Joi.string().optional(),
	enum: Joi.array().items(Joi.string().required()).optional(),
	default: Joi.alternatives(Joi.string().optional(), Joi.number().optional()).optional(),
	format: Joi.string().optional(),
	minimum: Joi.number().integer().optional(),
	maximum: Joi.number().integer().optional(),
	minLength: Joi.number().integer().optional(),
	maxLength: Joi.number().integer().optional(),
	schema: Joi.object(responseSchema).optional(),
};

const propertyKey = Joi.string().required();
const propertyEntry = Joi.object().required();

const definition = {
	type: Joi.string().required(),
	properties: Joi.object().pattern(propertyKey, propertyEntry).required(),
	description: Joi.string().optional(),
	required: Joi.array().items(Joi.string().required()).optional(),
};

const parameterKey = Joi.string().required();
const parameterEntry = Joi.object(parameter).required();

const definitionKey = Joi.string().required();
const definitionEntry = Joi.object(definition).required();

const specResponseSchema = {
	swagger: Joi.string().required(),
	info: Joi.object(info).required(),
	basePath: Joi.string().required(),
	tags: Joi.array().items(tag).required(),
	schemes: Joi.array().items(Joi.string().pattern(regex.SWAGGER_SCHEMES).required()).required(),
	paths: Joi.object().pattern(pathKey, pathEntry).required(),
	parameters: Joi.object().pattern(parameterKey, parameterEntry).required(),
	definitions: Joi.object().pattern(definitionKey, definitionEntry).required(),
	responses: Joi.object().pattern(responseKey, responseEntry).required(),
};

module.exports = {
	specResponseSchema: Joi.object(specResponseSchema).required(),
};
