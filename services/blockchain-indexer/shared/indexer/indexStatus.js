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
	DB: { MySQL: { getTableInstance } },
	Signals,
} = require('lisk-service-framework');

const {
	indexValidatorCommissionInfo,
	indexStakersInfo,
} = require('./validatorIndex');

const {
	getCurrentHeight,
	getGenesisHeight,
	updateFinalizedHeight,
} = require('../constants');

const logger = Logger();

const blocksTableSchema = require('../database/schema/blocks');

const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysqlReplica;

const getBlocksTable = () => getTableInstance(blocksTableSchema, MYSQL_ENDPOINT);

let isIndexReady = false;
const setIndexReadyStatus = isReady => isIndexReady = isReady;
const getIndexReadyStatus = () => isIndexReady;

const getIndexStats = async () => {
	try {
		const blocksTable = await getBlocksTable();
		const currentChainHeight = await getCurrentHeight();
		const genesisHeight = await getGenesisHeight();
		const numBlocksIndexed = await blocksTable.count();
		const [lastIndexedBlock = {}] = await blocksTable.find({ sort: 'height:desc', limit: 1 }, ['height']);
		const chainLength = currentChainHeight - genesisHeight + 1;
		const percentage = (Math.floor(((numBlocksIndexed) / chainLength) * 10000) / 100).toFixed(2);

		return {
			currentChainHeight,
			genesisHeight,
			numBlocksIndexed,
			lastIndexedBlock,
			chainLength,
			percentage,
		};
	} catch (err) {
		logger.warn(`Error while checking index readiness: ${err.message}`);
		return { error: true };
	}
};

const validateIndexReadiness = async ({ strict } = {}) => {
	const { numBlocksIndexed, chainLength } = await getIndexStats();
	const chainLenToConsider = strict === true ? chainLength : chainLength - 1;
	return numBlocksIndexed >= chainLenToConsider;
};

const checkIndexReadiness = async () => {
	if (!getIndexReadyStatus() // status is set only once
		&& await validateIndexReadiness()) { // last block is being indexed atm
		setIndexReadyStatus(true);
		logger.info('The blockchain index is complete.');
		logger.debug(`'blockIndexReady' signal: ${Signals.get('blockIndexReady')}`);
		Signals.get('blockIndexReady').dispatch(true);
	}
};

const reportIndexStatus = async () => {
	const indexStats = await getIndexStats();
	const {
		currentChainHeight,
		numBlocksIndexed,
		lastIndexedBlock = {},
		chainLength,
		percentage,
	} = indexStats;

	Signals.get('indexStatUpdate').dispatch(indexStats);

	logger.info([
		`currentChainHeight: ${currentChainHeight}`,
		`lastIndexedBlockHeight: ${lastIndexedBlock.height}`,
	].join(', '));

	logger.info(`Block index status: ${numBlocksIndexed}/${chainLength} blocks indexed (${percentage}%).`);
};

const init = async () => {
	// Initialize index status reporting and schedule regular updates
	await reportIndexStatus();
	setInterval(reportIndexStatus, 15 * 1000); // ms

	// Register event listeners
	Signals.get('newBlock').add(checkIndexReadiness);
	Signals.get('chainNewBlock').add(updateFinalizedHeight);

	// Index stakers and commission information available in genesis block
	await indexValidatorCommissionInfo();
	await indexStakersInfo();
};

module.exports = {
	getIndexReadyStatus,
	getIndexStats,
	init,
};
