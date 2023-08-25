/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
	DB: { MySQL: { getTableInstance } },
} = require('lisk-service-framework');
const config = require('../../../../config');

const { TRANSACTION_STATUS } = require('../../../constants');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;

const { indexAccountAddress } = require('../../accountIndex');

const nftTableSchema = require('../../../database/schema/nft');
const transactionsTableSchema = require('../../../database/schema/transactions');

const getNFTTable = () => getTableInstance(nftTableSchema, MYSQL_ENDPOINT);
const getTransactionsTable = () => getTableInstance(transactionsTableSchema, MYSQL_ENDPOINT);

// Command specific constants
const COMMAND_NAME = 'transferCrossChain';

// eslint-disable-next-line no-unused-vars
const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	logger.trace(`Updating index for the account with address ${tx.params.recipientAddress} asynchronously.`);
	indexAccountAddress(tx.params.recipientAddress);

	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESSFUL) return;

	const nftTable = await getNFTTable();
	const transactionsTable = await getTransactionsTable();

	tx = {
		...tx,
		...tx.params,
	};

	logger.trace(`Updating owner of nft ${tx.nftID} to ${tx.recipientAddress}.`);
	const nft = {
		nftID: tx.nftID,
		owner: tx.recipientAddress,
		escrowChainID: tx.receivingChainID,
	};
	await nftTable.upsert(nft, dbTrx);
	logger.debug(`Updated owner of nft ${tx.nftID} to ${tx.recipientAddress}.`);

	logger.trace(`Indexing transaction ${tx.id} contained in block at height ${tx.height}.`);
	tx.tokenID = tx.nftID;
	await transactionsTable.upsert(tx, dbTrx);
	logger.debug(`Indexed transaction ${tx.id} contained in block at height ${tx.height}.`);
};

// eslint-disable-next-line no-unused-vars
const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	logger.trace(`Updating index for the account with address ${tx.params.recipientAddress} asynchronously.`);
	indexAccountAddress(tx.params.recipientAddress);

	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESSFUL) return;

	const nftTable = await getNFTTable();

	tx = {
		...tx,
		...tx.params,
	};

	logger.trace(`Updating owner of nft ${tx.nftID} to ${tx.senderAddress}.`);
	const nft = {
		nftID: tx.nftID,
		owner: tx.senderAddress,
		escrowChainID: null,
	};
	await nftTable.upsert(nft, dbTrx);
	logger.debug(`Updated owner of nft ${tx.nftID} to ${tx.senderAddress}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
