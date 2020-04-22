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
const logger = require('./logger')();

const types = {
	blocks: 'blocks',
	transactions: 'transactions',
};

const typesList = Object.values(types);

const defaultSorts = {
	[types.blocks]: 'height:desc',
	[types.transactions]: 'timestamp:desc',
};

const recent = {
	[types.blocks]: [],
	[types.transactions]: [],
};

const totalCountsByType = { };

let CoreService;

const init = (core = CoreService) => {
	typesList.forEach(async (type) => {
		const params = { sort: defaultSorts[type], limit: 100 };
		const latestItems = await core.get(`/${type}`, params);
		recent[type] = [
			...latestItems.data,
			...(await core.get(`/${type}`, { ...params, offset: 100 })).data,
		];
		totalCountsByType[type] = latestItems.meta.count || latestItems.data[0].height;
		logger.info(`Initialized with ${recent[type].length} ${type}`);
	});
	CoreService = core;
};

const bumpConfirmations = () => (
	typesList.forEach((type) => {
		recent[type] = recent[type].map(({ confirmations, ...rest }) => ({
			...rest,
			confirmations: confirmations + 1,
		}));
	})
);

const addNewItem = (type, item) => {
	totalCountsByType[type] += 1;
	recent[type] = [
		item,
		...recent[type],
	].slice(0, 200);
};

const addNewBlock = (block, transactions) => {
	const previousBlock = recent[types.blocks][0];
	if (!previousBlock) {
		logger.warn('Not yet initialized.');
	} else if (!block || !block.id || !block.previousBlockId) {
		logger.warn(`Invalid block received: ${block}`);
	} else if (previousBlock.id === block.id) {
		logger.warn(`Same block received again block.id: ${block.id}`);
	} else if (previousBlock.id !== block.previousBlockId) {
		logger.warn(`Fork detected: New block.previousBlockId: ${block.previousBlockId}; Last block.id: ${recent[types.blocks][0].id}`);
		init();
	} else {
		bumpConfirmations();
		addNewItem(types.blocks, block);
		transactions.forEach(
			async ({ relays, receivedAt, ...transaction }) => {
				addNewItem(types.transactions, {
					...transaction,
					recipientPublicKey: await CoreService.getPublicKeyByAddress(transaction.recipientId),
					blockId: block.id,
					height: block.height,
					confirmations: 1,
				});
			});

		logger.debug(`Cache updated with new block, height: ${block.height}`);
	}
};

const getCachedItem = async (type, params) => {
	const defaultSort = defaultSorts[type];
	const {
		limit = 10,
		offset = 0,
		sort = defaultSort,
		...otherParams
	} = params;
	let data = [];
	let count;
	if (params.id && offset === 0) {
		data = recent[type].filter(({ id }) => id === params.id);
		count = 1;
	} else if (
		Object.keys(otherParams).length === 0
      && recent[type].length >= offset + limit
      && sort === defaultSort) {
		data = recent[type].slice(offset, limit);
		count = totalCountsByType[type];
	}
	if (data.length) {
		return {
			data,
			meta: {
				count,
				limit,
				offset,
			},
		};
	}
	return null;
};

const getCachedBlocks = getCachedItem.bind(null, types.blocks);
const getCachedTransactions = getCachedItem.bind(null, types.transactions);

module.exports = {
	getCachedBlocks,
	getCachedTransactions,
	addNewBlock,
	init,
};
