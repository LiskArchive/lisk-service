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
const CoreService = require('../../services/core.js');
const ObjectUtilService = require('../../services/object.js');
const { errorCodes: { NOT_FOUND } } = require('../../errorCodes.js');

const isEmptyArray = ObjectUtilService.isEmptyArray;

const getBlocksData = async (params) => {
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

	const data = await Promise.all(response.data.map(async (block) => {
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
		const lastBlock = await CoreService.getBlocks({
			sort: 'height:desc',
			limit: 1,
		});
		total = lastBlock.data[0].height;
	}

	result.data = data;
	result.meta.count = data.length;
	result.meta.total = total;
	result.meta.offset = response.meta ? response.meta.offset : 0;

	return result;
};

const getBlocks = async (params) => {
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

	return {
		data: {
			data: response.data,
			meta: response.meta,
			link: {},
		},
	};
};

const getBestBlocks = async (params) => {
	const response = await getBlocksData(Object.assign(params, {
		sort: 'totalAmount:desc',
	}));
	const blocks = response.data;

	return {
		data: {
			data: blocks,
			meta: response.meta,
			link: response.link,
		},
	};
};

const getLastBlocks = async (params) => {
	const response = await getBlocksData(Object.assign(params, {
		sort: 'timestamp:desc',
	}));
	const blocks = response.data;

	return {
		data: {
			data: blocks,
			meta: response.meta,
			link: {},
		},
	};
};

module.exports = {
	getBlocks,
	getBestBlocks,
	getLastBlocks,
};
