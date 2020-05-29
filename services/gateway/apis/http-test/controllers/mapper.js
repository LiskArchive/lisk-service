/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
/* eslint-disable no-unused-vars */
const pathLib = require('path');
const requireAll = require('require-all');
const MapperService = require('../../../services/mapper');
const logger = require('../../../services/logger')();
const utils = require('../../../services/utils');
const CacheService = require('../../../services/cache.js');
const csvConverter = require('json-2-csv');

const responseStatus = {
	OK: { code: 200 },
	NOT_FOUND: { code: 404 },
	INVALID_PARAMS: { code: 400 },
	LARGE_PAYLOAD: { code: 413 },
	INVALID_RESPONSE: { code: 500 },
	SERVER_ERROR: { code: 500 },
	FORBIDDEN: { code: 403 },
};

const errorMsg = {
	400: 'Bad request.',
	403: 'Forbidden',
	404: 'Not found.',
	413: 'Data size exceeds maximum permitted.',
	500: 'Error during data fetch.',
};

const redisConfig = {
	host: process.env.REDIS_HOST || 'localhost',
	port: process.env.REDIS_PORT || 6379,
	db: process.env.REDIS_DB || 0,
};

const controllers = requireAll({
	dirname: pathLib.resolve(__dirname, '../../../collectors'),
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
});

const cache = new CacheService(redisConfig);

const mappers = requireAll({
	dirname: pathLib.resolve(__dirname, '../mappers'),
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
});

const mapperIndex = Object.keys(mappers).reduce((acc, cur) => {
	acc[`${mappers[cur].method || 'GET'}:${mappers[cur].swaggerApiPath}`] = mappers[cur];
	return acc;
}, {});

const redisMapperRequest = (req, res) => {
	const mapper = mapperIndex[req.swagger.operation.pathObject.path];
	if (mapper) {
		cache.read(mapper.sourceRedisKey).then((json) => {
			const output = MapperService(json, mapper.definition);
			return res.json(Object.assign({}, mapper.envelope, output));
		}).catch((err) => {
			const message = 'Internal server error';
			logger.warn(message);
			logger.warn(err);
			res.status(500);
			return res.json({ error: true, message });
		});
	} else {
		const message = `Mapper for ${req.swagger.apiPath} not found.`;
		logger.warn(message);
		res.status(500);
		return res.json({ error: true, message });
	}
	return null; // for eslint
};

const httpResponse = (res, status, message) => {
	if (status !== 'OK') {
		const msg = 'Internal server error';
		logger.warn(msg);
		logger.warn(message);
		res.status(responseStatus[status].code);
		return res.json({ error: true, message });
	}

	return res.json(message);
};

const csvResponse = async (res, filename, content) => {
	try {
		if (!content) {
			res.status(responseStatus.NOT_FOUND.code);
			res.send();
		} else {
			const options = {};
			csvConverter.json2csv(content, (err, csv) => {
				if (err) throw new Error(err);
				res.header('Content-disposition', `attachment; filename=${filename || 'file.csv'}`);
				res.header('Content-type', 'text/csv');
				res.send(csv);
			}, options);
		}
	} catch (err) {
		const message = 'Internal server error';
		logger.warn(message);
		logger.warn(err.message);
		logger.warn(content);
		res.status(responseStatus.SERVER_ERROR.code);
		return res.json({ error: true, content });
	}
	return undefined;
};

const otherResponse = (res, content, output, reqParams) => {
	if (output === 'csv') return csvResponse(res, `${reqParams.account_id}.csv` || 'export.csv', content.data);
	return httpResponse(res, 'OK', content);
};

const mapperRequest = async (req, res) => {
	const mapper = mapperIndex[`${req.method}:${req.swagger.operation.pathObject.path}`];

	if (!mapper) {
		return httpResponse(res, 'SERVER_ERROR', `Mapper for ${req.swagger.operation.pathObject.path} not found.`);
	}
	if (!Array.isArray(mapper.source) || mapper.source.length === 0) {
		return httpResponse(res, 'SERVER_ERROR', `Source for ${req.swagger.apiPath} not defined.`);
	}

	const source = mapper.source[0];
	const params = utils.parseParams({
		swaggerParams: utils.parseSwaggerParams(req.swagger.params),
		inputParams: req.query,
	});

	if (Object.keys(params.invalid).length > 0) {
		const message = `Wrong input parameters: ${Object.keys(params.invalid).join(', ')}`;
		logger.debug(message);
		return httpResponse(res, 'INVALID_PARAMS', message);
	}

	let json;

	try {
		if (controllers[source.type]) {
			json = await controllers[source.type](
				req.swagger.apiPath,
				source,
				params.valid || {});
		} else {
			logger.error(`Unsupported source for ${req.swagger.apiPath}.`);
			return httpResponse(res, 'SERVER_ERROR', `Unsupported source for ${req.swagger.apiPath}.`);
		}
	} catch (err) {
		logger.error(err.message);
		return httpResponse(res, err.code, errorMsg[responseStatus[err.code].code]);
	}

	let result;
	try {
		const transformedResult = MapperService(json, source.definition);
		result = Object.assign({}, mapper.envelope, transformedResult);
	} catch (err) {
		logger.error(err.message);
		return httpResponse(res, 'SERVER_ERROR', 'Server error, failed on transforming.');
	}

	return otherResponse(res, result, mapper.output || 'json', params.valid);
};

const featureNotImplemented = (req, res) => {
	const message = 'Feature not implemented';
	res.status(501);
	return res.json({ error: true, message });
};

module.exports = {
	getHello: mapperRequest,
};
