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

const { getNodeInfo } = require('./actions_1');
const { getGenesisBlockFromFS } = require('./blocksUtils');
const { timeoutMessage, invokeAction } = require('./client');
const { decodeBlock } = require('./decoder');
const { parseToJSONCompatObj } = require('../parser');

const logger = Logger();

let genesisHeight;
let genesisBlockID;

const getGenesisHeight = async () => {
	if (!genesisHeight) {
		const nodeInfo = await getNodeInfo();
		genesisHeight = nodeInfo.genesisHeight ? nodeInfo.genesisHeight : 0;
	}
	return genesisHeight;
};

const getGenesisBlock = async (includeAccounts = false) => {
	try {
		const block = await getGenesisBlockFromFS();
		const { header: { asset: { accounts, ...remAsset }, ...remHeader }, payload } = block;
		const finalAccounts = includeAccounts ? accounts : [];
		const metaMessage = 'Fetch the genesis accounts with \'getNumberOfGenesisAccounts\' and \'getGenesisAccounts\' methods';

		return {
			header: {
				asset: {
					...remAsset,
					accounts: finalAccounts,
				},
				...remHeader,
			},
			payload,
			meta: {
				isGenesisBlock: true,
				message: includeAccounts ? '' : metaMessage,
			},
		};
	} catch (_) {
		logger.debug('Genesis block snapshot retrieval was not possible, attempting to retrieve directly from the node.');
	}

	const height = await getGenesisHeight();
	try {
		const encodedBlock = await invokeAction('app_getBlockByHeight', { height });
		const block = await decodeBlock(encodedBlock);
		return { ...parseToJSONCompatObj(block), _raw: encodedBlock };
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getGenesisBlock\'');
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

const getNumberOfGenesisAccounts = async () => {
	const block = await getGenesisBlock(true);
	const { header: { asset: { accounts } } } = block;
	return accounts.length;
};

const getGenesisAccounts = async (limit, offset) => {
	const block = await getGenesisBlock(true);
	const { header: { asset: { accounts } } } = block;
	const accountsSlice = accounts.slice(offset, limit);
	return accountsSlice;
};

module.exports = {
	getGenesisHeight,
	getGenesisBlockID,
	getGenesisBlock,
	getNumberOfGenesisAccounts,
	getGenesisAccounts,
};
