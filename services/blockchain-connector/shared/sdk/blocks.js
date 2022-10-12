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
const { decodeBlock } = require('./decoder');
const {
	getLastBlock,
	getBlockByHeight,
	getBlocksByHeightBetween,
	getBlockByID,
	getBlocksByIDs,
} = require('./endpoints');

const getLastBlockDecoded = async () => {
	const block = await getLastBlock();
	const decodedBlock = decodeBlock(block);
	return decodedBlock;
};

const getBlockByHeightDecoded = async (height) => {
	const block = await getBlockByHeight(height);
	const decodedBlock = decodeBlock(block);
	return decodedBlock;
};

const getBlocksByHeightBetweenDecoded = async ({ from, to }) => {
	const blocks = await getBlocksByHeightBetween({ from, to });
	const decodedBlocks = blocks.map(b => decodeBlock(b));
	return decodedBlocks;
};

const getBlockByIDDecoded = async (id) => {
	const block = await getBlockByID(id);
	const decodedBlock = decodeBlock(block);
	return decodedBlock;
};

const getBlocksByIDsDecoded = async (ids) => {
	const blocks = await getBlocksByIDs(ids);
	const decodedBlocks = blocks.map(b => decodeBlock(b));
	return decodedBlocks;
};

module.exports = {
	getLastBlock: getLastBlockDecoded,
	getBlockByHeight: getBlockByHeightDecoded,
	getBlocksByHeightBetween: getBlocksByHeightBetweenDecoded,
	getBlockByID: getBlockByIDDecoded,
	getBlocksByIDs: getBlocksByIDsDecoded,
};
