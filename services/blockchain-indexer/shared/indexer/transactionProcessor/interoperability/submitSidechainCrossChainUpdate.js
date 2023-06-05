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
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const { MODULE_NAME } = require('./index');
const { COMMAND_NAME: COMMAND_NAME_REGISTER_MAINCHAIN } = require('./registerMainchain');
const { COMMAND_NAME: COMMAND_NAME_REGISTER_SIDECHAIN } = require('./registerSidechain');

const config = require('../../../../config');
const { TRANSACTION_STATUS } = require('../../../constants');

const logger = Logger();

const MYSQL_ENDPOINT = config.endpoints.mysql;
const blockchainAppsTableSchema = require('../../../database/schema/blockchainApps');
const ccuTableSchema = require('../../../database/schema/ccu');
const { getTransactions, isMainchain } = require('../../../dataService');
const { getChainInfo } = require('./registerMainchain');
const { APP_STATUS } = require('../../../dataService/business/interoperability/constants');

const getBlockchainAppsTable = () => getTableInstance(blockchainAppsTableSchema, MYSQL_ENDPOINT);
const getCCUTable = () => getTableInstance(ccuTableSchema, MYSQL_ENDPOINT);

// Command specific constants
const COMMAND_NAME = 'submitSidechainCrossChainUpdate';

const applyTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESS) return;

	const blockchainAppsTable = await getBlockchainAppsTable();
	const ccuTable = await getCCUTable();

	const chainInfo = await getChainInfo(tx.params.sendingChainID);

	logger.trace(`Indexing cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);

	const appInfo = {
		chainID: tx.params.sendingChainID,
		status: chainInfo.status,
		lastUpdated: blockHeader.timestamp,
		lastCertificateHeight: blockHeader.height,
	};

	await blockchainAppsTable.upsert(appInfo, dbTrx);
	await ccuTable.upsert({
		height: tx.height,
		sendingChainID: tx.params.sendingChainID,
		transactionID: tx.id,
	}, dbTrx);

	logger.debug(`Indexed cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);
};

const revertTransaction = async (blockHeader, tx, events, dbTrx) => {
	if (tx.executionStatus !== TRANSACTION_STATUS.SUCCESS) return;

	const blockchainAppsTable = await getBlockchainAppsTable();
	const ccuTable = await getCCUTable();

	logger.trace(`Reverting cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);

	let prevTransaction;
	const chainInfo = await getChainInfo(tx.params.sendingChainID);

	if (chainInfo.status === APP_STATUS.ACTIVE) {
		const searchParams = {
			sendingChainID: tx.params.sendingChainID,
			propBetweens: [{
				property: 'height',
				lowerThan: blockHeader.height,
			}],
			sort: 'height:desc',
		};

		const resultSet = await ccuTable.find(searchParams, 'height');

		for (let i = 0; i < resultSet.length; i++) {
			/* eslint-disable no-await-in-loop */
			const result = (await getTransactions({
				height: resultSet[i].height,
				moduleCommand: tx.moduleCommand,
				executionStatus: TRANSACTION_STATUS.SUCCESS,
			})).data;

			if (result.length) {
				prevTransaction = result.find(e => e.params.sendingChainID === tx.params.sendingChainID);
				break;
			}
		}
	} else if (chainInfo.status === APP_STATUS.REGISTERED) {
		const COMMAND = await isMainchain()
			? COMMAND_NAME_REGISTER_SIDECHAIN
			: COMMAND_NAME_REGISTER_MAINCHAIN;

		const result = (await getTransactions({
			moduleCommand: `${MODULE_NAME}:${COMMAND}`,
			executionStatus: TRANSACTION_STATUS.SUCCESS,
			propBetweens: [{
				property: 'height',
				lowerThan: blockHeader.height,
			}],
		})).data;

		if (result.length) {
			prevTransaction = result.find(e => e.params.sendingChainID === tx.params.sendingChainID);
		}
	}

	const appInfo = {
		chainID: tx.params.sendingChainID,
		status: chainInfo.status,
		lastUpdated: prevTransaction.block.timestamp,
		lastCertificateHeight: prevTransaction.block.height,
	};

	await blockchainAppsTable.upsert(appInfo, dbTrx);
	/* eslint-enable no-await-in-loop */
	logger.debug(`Reverted cross chain update transaction ${tx.id} contained in block at height ${tx.height}.`);
};

module.exports = {
	COMMAND_NAME,
	applyTransaction,
	revertTransaction,
};
