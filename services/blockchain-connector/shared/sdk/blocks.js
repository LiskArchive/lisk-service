/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const { formatBlock } = require('./formatter');
const {
	getLastBlock,
	getBlockByHeight,
	getBlocksByHeightBetween,
	getBlockByID,
	getBlocksByIDs,
} = require('./endpoints');

const getLastBlockFormatted = async () => {
	const block = await getLastBlock();
	const formattedBlock = formatBlock(block);
	return formattedBlock;
};

const getBlockByHeightFormatted = async (height, includeGenesisAssets = false) => {
	const block = await getBlockByHeight(height, includeGenesisAssets);
	const formattedBlock = formatBlock(block);
	return formattedBlock;
};

const getBlocksByHeightBetweenFormatted = async ({ from, to }) => {
	const blocks = await getBlocksByHeightBetween({ from, to });
	const formattedBlocks = blocks.map(b => formatBlock(b));
	return formattedBlocks;
};

const getBlockByIDFormatted = async (id) => {
	const block = await getBlockByID(id);
	const formattedBlock = formatBlock(block);
	return formattedBlock;
};

const getBlocksByIDsFormatted = async (ids) => {
	const blocks = await getBlocksByIDs(ids);
	const formattedBlocks = blocks.map(b => formatBlock(b));
	return formattedBlocks;
};

module.exports = {
	getLastBlock: getLastBlockFormatted,
	getBlockByHeight: getBlockByHeightFormatted,
	getBlocksByHeightBetween: getBlocksByHeightBetweenFormatted,
	getBlockByID: getBlockByIDFormatted,
	getBlocksByIDs: getBlocksByIDsFormatted,
};
