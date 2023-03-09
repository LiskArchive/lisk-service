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
const {
	Logger,
	Exceptions: { TimeoutException },
} = require('lisk-service-framework');

const { getNodeInfo } = require('./endpoints_1');
const { getGenesisBlockFromFS } = require('./blocksUtils');
const { formatBlock } = require('./formatter');
const { MODULE_NAME_POS } = require('./constants/names');

const { timeoutMessage, invokeEndpoint } = require('./client');
const config = require('../../config');

const logger = Logger();

let genesisHeight;
let genesisBlockID;
let genesisConfig;

const getGenesisHeight = async () => {
	// TODO: Verify if this is correct
	if (typeof genesisHeight !== 'number') {
		const nodeInfo = await getNodeInfo();
		genesisHeight = 'genesisHeight' in nodeInfo ? nodeInfo.genesisHeight : config.genesisHeight;
	}
	return genesisHeight;
};

const getGenesisBlock = async () => {
	try {
		const block = await getGenesisBlockFromFS();
		// Filter out assets from genesis block and assign empty array
		return { header: block.header, transactions: block.transactions, assets: [] };
	} catch (_) {
		logger.debug('Genesis block snapshot retrieval was not possible, attempting to retrieve directly from the node.');
	}

	const height = await getGenesisHeight();
	try {
		const block = await invokeEndpoint('chain_getBlockByHeight', { height });
		return block;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getGenesisBlock\'.');
		}
		throw err;
	}
};

const getGenesisBlockID = async () => {
	if (!genesisBlockID) {
		const genesisBlock = await getGenesisBlock();
		genesisBlockID = genesisBlock.header.id;
	}
	return genesisBlockID;
};

const getGenesisConfig = async () => {
	try {
		if (!genesisConfig) {
			genesisConfig = (await getNodeInfo()).genesis;
		}
		return genesisConfig;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getGenesisConfig\'.');
		}
		throw err;
	}
};

const getPoSGenesisStakers = async () => {
	try {
		const block = await getGenesisBlockFromFS();
		const formattedBlock = await formatBlock(block);
		const { stakers = [] } = (formattedBlock.assets
			.find(asset => asset.module === MODULE_NAME_POS)).data;
		return stakers;
	} catch (error) {
		if (error.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getPoSGenesisStakers\'.');
		}
		throw error;
	}
};

const getPoSGenesisValidators = async () => {
	try {
		const block = await getGenesisBlockFromFS();
		const formattedBlock = await formatBlock(block);
		const { validators = [] } = (formattedBlock.assets
			.find(asset => asset.module === MODULE_NAME_POS)).data;
		return validators;
	} catch (error) {
		if (error.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getPoSGenesisValidators\'.');
		}
		throw error;
	}
};

module.exports = {
	getGenesisHeight,
	getGenesisBlockID,
	getGenesisBlock,
	getGenesisConfig,
	getPoSGenesisStakers,
	getPoSGenesisValidators,
};
