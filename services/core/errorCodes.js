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

/* eslint-disable key-spacing */

const errorCodeKeys = [
	'PARSE_ERROR',
	'INVALID_REQUEST',
	'METHOD_NOT_FOUND',
	'INVALID_PARAMS',
	'SERVER_ERROR',
	'NOT_FOUND',
	'UNAUTHORIZED',
	'FORBIDDEN',
	'TOO_MANY_REQUESTS',
	'NOT_IMPLEMENTED',
	'SERVICE_UNAVAILABLE',
];

const errorCodes = errorCodeKeys.reduce((acc, key) => ({ ...acc, [key]: key }), {});

const HTTP = {
	PARSE_ERROR:            [400, 'Bad Request'],
	INVALID_REQUEST:        [400, 'Bad Request'],
	METHOD_NOT_FOUND:       [404, 'Not Found'],
	INVALID_PARAMS:         [400, 'Bad Request'],
	SERVER_ERROR:           [500, 'Internal Server Error'],
	NOT_FOUND:              [404, 'Not Found'],
	UNAUTHORIZED:           [401, 'Unauthorized'],
	FORBIDDEN:              [403, 'Forbidden'],
	TOO_MANY_REQUESTS:      [429, 'Too Many Requests'],
	NOT_IMPLEMENTED:        [501, 'Not Implemented'],
	SERVICE_UNAVAILABLE:    [503, 'Service Unavailable'],
};

const JSON_RPC = {
	PARSE_ERROR:            [-32700, 'Parse error'],
	INVALID_REQUEST:        [-32600, 'Invalid Request'],
	METHOD_NOT_FOUND:       [-32601, 'Method not found'],
	INVALID_PARAMS:         [-32602, 'Invalid params'],
	SERVER_ERROR:           [-32000, 'Server error'],
	NOT_FOUND:              [null, ''], // not defined, use {} response instead
	UNAUTHORIZED:           [-32600, 'Invalid Request'],
	FORBIDDEN:              [-32600, 'Invalid Request'],
	TOO_MANY_REQUESTS:      [-32001, 'Server error'],
	NOT_IMPLEMENTED:        [-32603, 'Internal error'],
	SERVICE_UNAVAILABLE:    [-32002, 'Server error'],
};

module.exports = {
	errorCodes,
	errorCodeKeys,
	HTTP,
	JSON_RPC,
};
