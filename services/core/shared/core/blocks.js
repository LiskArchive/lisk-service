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
const { Logger } = require('lisk-service-framework');
const util = require('util');

const logger = Logger();

const coreApi = require('./compat');
const { getUsernameByAddress } = require('./delegateUtils');

let lastBlock = {};

const setLastBlock = block => {
	if (block && block.height && block.height > lastBlock.height) lastBlock = block;
	else if (!lastBlock.height) lastBlock = block;
};
const getLastBlock = () => lastBlock;
const waitForLastBlock = () => new Promise((resolve) => {
	const checkLastBlock = (interval) => {
		const block = getLastBlock();
		if (block && block.height > 0) {
			if (interval) clearInterval(interval);
			resolve(getLastBlock());
		}
	};
	checkLastBlock();
	const interval = setInterval(() => checkLastBlock(interval), 500);
});

const getBlocksFromServer = async params => {
	const blocks = {
		data: [],
		meta: {},
	};

	if (params.blockId) logger.debug(`Retrieved block with id ${params.blockId} from Lisk Core`);
	else if (params.height) logger.debug(`Retrieved block with height: ${params.height} from Lisk Core`);
	else logger.debug(`Retrieved block with custom search: ${util.inspect(params)} from Lisk Core`);

	const response = await coreApi.getBlocks(params);
	if (response.data) blocks.data = response.data;
	if (response.meta) blocks.meta = response.meta;

	if (blocks.data.length) {
		blocks.data.forEach(block => setLastBlock(block));
	}

	return blocks;
};

const getBlocks = async (params = {}) => {
	let blocks = {
		data: [],
		meta: {},
	};

	if (blocks.data.length === 0) {
		blocks = await getBlocksFromServer(params);
	}

	await Promise.all(blocks.data.map(async block => {
		block.generatorUsername = await getUsernameByAddress(block.generatorAddress);
		return block;
	}));

	let total;
	if (params.generatorPublicKey) {
		delete blocks.meta.total;
	} else if (params.blockId || params.height) {
		total = blocks.length;
	} else {
		total = (getLastBlock()).height;
	}

	if (coreApi.getFinalizedHeight) {
		const finalHeight = coreApi.getFinalizedHeight();
		const data = blocks.data.map((block) => Object.assign(block,
			{ isFinal: block.height <= finalHeight },
		));
		blocks.data = data;
	}

	return {
		data: blocks.data,
		meta: {
			count: blocks.data.length,
			offset: parseInt(params.offset, 10) || 0,
			total,
		},
	};
};

const preloadBlocksOneByOne = async (n) => {
	let blockId = (getLastBlock()).previousBlockId;
	for (let i = 0; i <= n; i++) {
		// eslint-disable-next-line no-await-in-loop
		blockId = (await getBlocks({ blockId })).data[0].previousBlockId;
	}
};

const preloadBlocksByPage = async (n) => {
	const pageSize = 100;
	const numberOfPages = Math.ceil(n / pageSize);

	const limit = 100;
	for (let i = 0; i <= numberOfPages; i++) {
		// eslint-disable-next-line no-await-in-loop
		await getBlocks({ sort: 'height:desc', offset: (i * limit) + 1, limit });
	}
};

const reloadBlocks = async (n) => preloadBlocksByPage(n);

const performLastBlockUpdate = async () => {
	const block = await getBlocks({ limit: 1, sort: 'height:desc' });
	setLastBlock(block.data[0]);
	logger.debug(`Current block height: ${block.data[0].height}  (id=${block.data[0].id})`);
};

const initBlocks = (async () => {
	await coreApi.updateFinalizedHeight();

	performLastBlockUpdate();
})();

module.exports = {
	getBlocks,
	preloadBlocksOneByOne,
	preloadBlocksByPage,
	setLastBlock,
	getLastBlock,
	waitForLastBlock,
	initBlocks,
	reloadBlocks,
	performLastBlockUpdate,
};
