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

const CoreService = require('../../shared/core');

const { isEmptyArray } = ObjectUtilService;

const getBlocksData = async params => {
	const result = {
		data: [],
		meta: {
			count: 0,
			offset: parseInt(params.offset, 10) || 0,
			total: 0,
		},
	};
	const response = await CoreService.getBlocks(params);
	if (!Array.isArray(response.data)) return result;
	let total;

	const data = await Promise.all(response.data.map(async block => {
		const username = await CoreService.getUsernameByAddress(block.generatorAddress);
		if (username) {
			block.generatorUsername = username;
		}
		return block;
	}));

	if (params.generatorPublicKey) {
		delete result.meta.total;
	} else if (params.blockId || params.height) {
		total = data.length;
	} else {
		total = (CoreService.getLastBlock()).height;
	}

	result.data = data;
	result.meta.count = data.length;
	result.meta.total = total;
	result.meta.offset = response.meta ? response.meta.offset : 0;

	return result;
};

const getBlocks = async params => {
	if (typeof params.height === 'number') {
		params.height = `${params.height}`;
	}
	if (params.address) {
		params.generatorPublicKey = await CoreService.getPublicKeyByAny(params.address);
		if (!params.generatorPublicKey) return { status: NOT_FOUND, data: { error: `Account ID ${params.address} not found.` } };
		delete params.address;
	}
	const response = await getBlocksData(params);

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

	const finalHeight = CoreService.getFinalizedHeight();
	const data = response.data.map((block) => {
		if (block.height <= finalHeight) {
			block.isFinal = true;
		} else {
			block.isFinal = false;
		}
		return block;
	});

	return {
		data,
		meta: response.meta,
		link: {},
	};
};

const getBestBlocks = async params => {
	const response = await getBlocksData(Object.assign(params, {
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
	const response = await getBlocksData(Object.assign(params, {
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
