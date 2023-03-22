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
// import regex from './regex';

const SWAGGER_VERSION = ['2.0'];
const SWAGGER_PARAMETER_BODY = ['body'];
const SWAGGER_PARAMETER_HEADER = ['header'];
const SWAGGER_PARAMETER_QUERY = ['query'];
const SWAGGER_PARAMETER_PATH = ['body'];
const SWAGGER_PARAMETER_FORM = ['formData'];

const SWAGGER_SCHEMES_LIST = ['http', 'https', 'ws', 'wss'];
const TYPES_ENUM = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string', 'file'];
const COLLECTION_FORMAT = ['csv', 'ssv', 'tsv', 'pipes'];

const externalDocs = {
	url: Joi.string().required(),
	description: Joi.string().optional(),
};

const contact = {
	name: Joi.string().optional(),
	url: Joi.string().optional(),
	email: Joi.string().optional(),
};

const license = {
	name: Joi.string().required(),
	url: Joi.string().optional(),
};

const info = {
	title: Joi.string().required(),
	version: Joi.string().required(),
	description: Joi.string().optional(),
	termsOfService: Joi.string().optional(),
	contact: Joi.object(contact).optional(),
	license: Joi.object(license).optional(),
};

const tag = {
	name: Joi.string().required(),
	description: Joi.string().optional(),
	externalDocs: Joi.object(externalDocs).optional(),
};

const jsonReference = {
	$ref: Joi.string().required(),
};

const xml = {
	name: Joi.string().optional(),
	namespace: Joi.string().optional(),
	prefix: Joi.string().optional(),
	attribute: Joi.boolean().optional(),
	wrapped: Joi.boolean().optional(),
};

const schema = {
	$ref: Joi.string().optional(),
	format: Joi.string().optional(),
	title: Joi.string().optional(),
	description: Joi.string().optional(),
	default: Joi.string().optional(),
	in: Joi.string().optional(),
	multipleOf: Joi.number().integer().optional(),
	maximum: Joi.number().integer().optional(),
	exclusiveMaximum: Joi.boolean().optional(),
	minimum: Joi.number().integer().optional(),
	exclusiveMinimum: Joi.boolean().optional(),
	maxLength: Joi.number().integer().min(0).optional(),
	minLength: Joi.number().integer().min(0).optional(),
	pattern: Joi.string().optional(),
	maxItems: Joi.number().integer().min(0).optional(),
	minItems: Joi.number().integer().min(0).optional(),
	uniqueItems: Joi.boolean().optional(),
	maxProperties: Joi.number().integer().min(0).optional(),
	minProperties: Joi.number().integer().min(0).optional(),
	required: Joi.array().items(Joi.string().optional()).optional(),
	enum: Joi.array().items(Joi.string().required()).optional(),
	additionalProperties: Joi.alternatives(Joi.boolean().optional(), Joi.string().optional())
		.optional(),
	type: Joi.alternatives(Joi.string().valid(...TYPES_ENUM).optional(), Joi.array().optional())
		.optional(),
	items: Joi.alternatives(
		Joi.object().optional(),
		Joi.array().min(1).optional(),
	).optional(),
	allOf: Joi.array().min(1).optional(),
	properties: Joi.object().optional(),
	discriminator: Joi.string().optional(),
	readOnly: Joi.boolean().optional(),
	xml: Joi.object(xml).optional(),
	externalDocs: Joi.string().optional(),
	example: Joi.object().optional(),
};

const fileSchema = {
	required: Joi.boolean().optional(),
	title: Joi.string().optional(),
	description: Joi.string().optional(),
	default: Joi.string().optional(),
	format: Joi.string().optional(),
	type: Joi.alternatives(Joi.string().valid(...TYPES_ENUM).optional(), Joi.array().optional())
		.required(),
	readOnly: Joi.boolean().optional(),
	externalDocs: Joi.string().optional(),
	example: Joi.object().optional(),
};

const commonProps = {
	format: Joi.string().optional(),
	description: Joi.string().optional(),
	default: Joi.any().optional(),
	multipleOf: Joi.number().integer().optional(),
	maximum: Joi.number().integer().optional(),
	exclusiveMaximum: Joi.boolean().optional(),
	minimum: Joi.number().integer().optional(),
	exclusiveMinimum: Joi.boolean().optional(),
	maxLength: Joi.number().integer().min(0).optional(),
	minLength: Joi.number().integer().min(0).optional(),
	pattern: Joi.string().optional(),
	maxItems: Joi.number().integer().min(0).optional(),
	minItems: Joi.number().integer().min(0).optional(),
	uniqueItems: Joi.boolean().optional(),
	enum: Joi.array().items(Joi.string().required()).optional(),
	type: Joi.alternatives(Joi.string().valid(...TYPES_ENUM).optional(), Joi.array().optional())
		.required(),
	items: Joi.alternatives(Joi.string().optional(), Joi.array().min(1).optional())
		.optional(),
	collectionFormat: Joi.string().valid(...COLLECTION_FORMAT).optional(),
};

const response = {
	description: Joi.string().required(),
	schema: Joi.alternatives(Joi.object(schema).optional(), Joi.object(fileSchema).optional())
		.optional(),
	headers: Joi.object(commonProps).optional(),
	examples: Joi.object().optional(),
};

const bodyParameter = {
	name: Joi.string().required(),
	in: Joi.string().valid(...SWAGGER_PARAMETER_BODY).required(),
	schema: Joi.object(schema).required(),
	description: Joi.string().optional(),
	required: Joi.boolean().optional(),
};

const headerParameterSubSchema = {
	...commonProps,
	name: Joi.string().required(),
	in: Joi.string().valid(...SWAGGER_PARAMETER_HEADER).required(),
	required: Joi.boolean().optional(),
};

const queryParameterSubSchema = {
	...commonProps,
	name: Joi.string().required(),
	in: Joi.string().valid(...SWAGGER_PARAMETER_QUERY).required(),
	allowEmptyValue: Joi.boolean().optional(),
	required: Joi.boolean().optional(),
};

const formDataParameterSubSchema = {
	...commonProps,
	name: Joi.string().required(),
	in: Joi.string().valid(...SWAGGER_PARAMETER_FORM).required(),
	allowEmptyValue: Joi.boolean().optional(),
	required: Joi.boolean().optional(),
};

const pathParameterSubSchema = {
	...commonProps,
	name: Joi.string().required(),
	in: Joi.string().valid(...SWAGGER_PARAMETER_PATH).required(),
	required: Joi.boolean().optional(),
};

const nonBodyParameter = Joi.alternatives(
	Joi.object(headerParameterSubSchema).optional(),
	Joi.object(formDataParameterSubSchema).optional(),
	Joi.object(queryParameterSubSchema).optional(),
	Joi.object(pathParameterSubSchema).optional(),
).optional();

const parameter = Joi.alternatives(bodyParameter, nonBodyParameter.optional()).optional();

// TODO: Enable when swagger response key is mapped as per schema
// const responseKey = Joi.string().pattern(regex.SWAGGER_RESPONSE_KEY).min(1).required();
const responseKey = Joi.string().min(1).required();
const responseEntry = Joi.alternatives(
	Joi.object(response).optional(),
	Joi.object(jsonReference).optional(),
).optional();

const pathEntries = {
	tags: Joi.array().items(Joi.string().required()).optional(),
	summary: Joi.string().optional(),
	description: Joi.string().optional(),
	parameters: Joi.array().items(Joi.alternatives(parameter, jsonReference)).optional(),
	responses: Joi.object().pattern(responseKey, responseEntry).optional(),
	operationId: Joi.string().optional(),
	deprecated: Joi.boolean().optional(),
	schemes: Joi.array().items(Joi.string().valid(...SWAGGER_SCHEMES_LIST).required()).optional(),
	externalDocs: Joi.object(externalDocs).optional(),
	produces: Joi.string().optional(),
	consumes: Joi.string().optional(),
	security: Joi.array().items(Joi.object().optional()).optional(),
};

const path = {
	$ref: Joi.string().optional(),
	get: Joi.object(pathEntries).optional(),
	post: Joi.object(pathEntries).optional(),
	put: Joi.object(pathEntries).optional(),
	delete: Joi.object(pathEntries).optional(),
	options: Joi.object(pathEntries).optional(),
	head: Joi.object(pathEntries).optional(),
	patch: Joi.object(pathEntries).optional(),
	parameters: Joi.array().items(Joi.alternatives(parameter, jsonReference)).optional(),
};

const pathKey = Joi.string().required();
const pathEntry = Joi.object(path).required();

const definitionKey = Joi.string().required();
const definitionEntry = Joi.object(schema).required();

const paramKey = Joi.string().required();
const paramEntry = Joi.alternatives(bodyParameter, nonBodyParameter).optional();

// Schema specified according to https://github.com/OAI/OpenAPI-Specification/blob/36a3a67264cc1c4f1eff110cea3ebfe679435108/schemas/v2.0/schema.json
const specResponseSchema = {
	swagger: Joi.string().valid(...SWAGGER_VERSION).required(),
	info: Joi.object(info).required(),
	host: Joi.string().optional(),
	basePath: Joi.string().optional(),
	schemes: Joi.array().items(Joi.string().valid(...SWAGGER_SCHEMES_LIST).required()).optional(),
	consumes: Joi.string().optional(),
	produces: Joi.string().optional(),
	paths: Joi.object().pattern(pathKey, pathEntry).required(),
	definitions: Joi.object().pattern(definitionKey, definitionEntry).optional(),
	parameters: Joi.object().pattern(paramKey, paramEntry).required(),
	responses: Joi.object().pattern(responseKey, responseEntry).optional(),
	security: Joi.array().items(Joi.object().optional()).optional(),
	securityDefinitions: Joi.object().optional(),
	tags: Joi.array().items(tag).optional(),
	externalDocs: Joi.object(externalDocs).optional(),
};

module.exports = {
	specResponseSchema: Joi.object(specResponseSchema).required(),
};
