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
const { HTTP, Utils } = require('lisk-service-framework');

const { StatusCodes: { NOT_FOUND } } = HTTP;
const ObjectUtilService = Utils.Data;

const Core = require('../../shared/core');

const { isEmptyArray } = ObjectUtilService;

const getBlocks = async params => {
	if (typeof params.height === 'number') {
		params.height = `${params.height}`;
	}
	if (params.username) {
		params.address = await Core.getAddressByUsername(params.username);
		if (!params.address) return { status: NOT_FOUND, data: { error: `Account ID ${params.username} not found.` } };
		delete params.username;
	}

	if (params.address) {
		params.generatorPublicKey = await Core.getPublicKeyByAny(params.address);
		if (!params.generatorPublicKey) return { status: NOT_FOUND, data: { error: `Account ID ${params.address} not found.` } };
		delete params.address;
	}

	const response = await Core.getBlocks(params);

	if (typeof params.blockId === 'string') {
		if (isEmptyArray(response.data)) {
			return { status: NOT_FOUND, data: { error: `Block ID ${params.blockId} not found.` } };
		}
	}

	if (typeof params.height === 'string') {
		if (isEmptyArray(response.data)) {
			return { status: NOT_FOUND, data: { error: `Height ${params.height} not found.` } };
		}
	}

	return {
		data: response.data,
		meta: response.meta,
		link: {},
	};
};

const getBestBlocks = async params => {
	const response = await Core.getBlocks(Object.assign(params, {
		sort: 'totalAmount:desc',
	}));
	const blocks = response.data;

	return {
		data: blocks,
		meta: response.meta,
		link: response.link,
	};
};

const getLastBlocks = async params => {
	const response = await Core.getBlocks(Object.assign(params, {
		sort: 'timestamp:desc',
	}));
	const blocks = response.data;

	return {
		data: blocks,
		meta: response.meta,
		link: {},
	};
};

module.exports = {
	getBlocks,
	getBestBlocks,
	getLastBlocks,
};
