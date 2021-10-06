/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const logger = require('lisk-service-framework').Logger();

const { getApiClient } = require('../common/wsRequest');
const { normalizeBlocks } = require('./blocks');

const config = require('../../../../config');

const getAccountAddressesFromEventPayload = async (data) => {
	const apiClient = await getApiClient();

	return data.accounts.map(acc => {
		const account = apiClient.account.decode(Buffer.from(acc, 'hex'));
		const accountAddressHex = account.address.toString('hex');
		return accountAddressHex;
	});
};

const register = async (events) => {
	const apiClient = await getApiClient();
	logger.info(`Registering ${config.endpoints.liskWs} for blockchain events`);

	apiClient.subscribe('app:block:new', async data => {
		try {
			const incomingBlock = apiClient.block.decode(Buffer.from(data.block, 'hex'));
			const [newBlock] = await normalizeBlocks([incomingBlock]);
			const affectedAccountAddresses = await getAccountAddressesFromEventPayload(data);

			logger.debug(`New block forged: ${newBlock.id} at height ${newBlock.height}`);
			events.newBlock(newBlock);
			events.updateAccountsByAddress(affectedAccountAddresses);
			events.calculateFeeEstimate();
		} catch (err) {
			logger.error(`Error while processing the 'app:block:new' event:\n${err.stack}`);
		}
	});

	apiClient.subscribe('app:block:delete', async data => {
		try {
			const incomingBlock = apiClient.block.decode(Buffer.from(data.block, 'hex'));
			const [deletedBlock] = await normalizeBlocks([incomingBlock]);
			const affectedAccountAddresses = await getAccountAddressesFromEventPayload(data);

			logger.debug(`Block deleted: ${deletedBlock.id} at height ${deletedBlock.height}`);
			events.deleteBlock(deletedBlock);
			events.updateAccountsByAddress(affectedAccountAddresses);
		} catch (err) {
			logger.error(`Error while processing the 'app:block:delete' event:\n${err.stack}`);
		}
	});

	apiClient.subscribe('app:chain:validators:change', data => {
		try {
			logger.debug(`Chain validators updated: ${data}`);
			events.newRound(data);
		} catch (err) {
			logger.error(`Error while processing the 'app:chain:validators:change' event:\n${err.stack}`);
		}
	});
};

module.exports = { register };
