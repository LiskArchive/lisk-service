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
const { ServiceBroker } = require('moleculer');
const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../../../config');
const accountBalancesTableSchema = require('../../../../shared/database/schema/accountBalances');
const { updateAccountBalances, accountBalanceIndexQueue, scheduleAccountBalanceUpdateFromEvents } = require('../../../../shared/indexer/accountBalanceIndex');
const { MODULE_SUB_STORE } = require('../../../../shared/constants');
const request = require('../../../../shared/utils/request');
const { MODULE } = require('../../../../shared/constants');
const { eventsIncludingTokenModule } = require('../../../constants/events');

const MYSQL_ENDPOINT = config.endpoints.mysql;
const getAccountBalancesTable = () => getTableInstance(accountBalancesTableSchema, MYSQL_ENDPOINT);

const broker = new ServiceBroker({
	transporter: config.transporter,
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});

let accountBalancesTable;
let usersSubStoreInfos;

beforeAll(async () => {
	await broker.start();
	await request.setAppContext({
		requestRpc: (method, params) => new Promise((resolve, reject) => {
			broker
				.call(method, params)
				.then(res => resolve(res))
				.catch(err => {
					console.error(`Error occurred! ${err.message}`);
					reject(err);
				});
		}),
	});

	accountBalancesTable = await getAccountBalancesTable();

	const tokenModuleData = await request.requestConnector(
		'getGenesisAssetByModule',
		{ module: MODULE.TOKEN, subStore: MODULE_SUB_STORE.TOKEN.USER },
	);
	usersSubStoreInfos = tokenModuleData[MODULE_SUB_STORE.TOKEN.USER];
});

describe('Test updateAccountBalances method', () => {
	it('should update account balances correctly for address having balances', async () => {
		const accountInfo = usersSubStoreInfos[0];

		// Delete all balances and check balance before update
		await accountBalancesTable.delete({});
		const balanceBeforeUpdate = await accountBalancesTable.find({ address: accountInfo.address, tokenID: accountInfo.tokenID }, ['balance']);
		expect(balanceBeforeUpdate.length).toBe(0);

		await updateAccountBalances(accountInfo.address);

		// Check balance after update
		const balanceAfterUpdate = await accountBalancesTable.find({ address: accountInfo.address, tokenID: accountInfo.tokenID }, ['balance']);
		expect(balanceAfterUpdate.length).toBe(1);
		expect(balanceAfterUpdate[0].balance).toBeGreaterThanOrEqual(0);
	});
});

describe('Test scheduleAccountBalanceUpdateFromEvents method', () => {
	beforeAll(async () => {
		await accountBalanceIndexQueue.queue.empty();
		await accountBalanceIndexQueue.queue.pause();
	});

	afterAll(async () => accountBalanceIndexQueue.queue.resume());

	it('should schedule account balance update correctly for token module events', async () => {
		const queueCountBeforeScheduling = await accountBalanceIndexQueue.queue.count();
		expect(queueCountBeforeScheduling).toBe(0);

		// Delete all balances and check balance before update
		const accountInfo = usersSubStoreInfos[0];
		await accountBalancesTable.delete({});
		const balanceBeforeUpdate = await accountBalancesTable.find({ address: accountInfo.address, tokenID: accountInfo.tokenID }, ['balance']);
		expect(balanceBeforeUpdate.length).toBe(0);

		await scheduleAccountBalanceUpdateFromEvents(eventsIncludingTokenModule);

		// Check queue job count after update
		const queueCountAfterScheduling = await accountBalanceIndexQueue.queue.count();
		expect(queueCountAfterScheduling).toBeGreaterThanOrEqual(1);
	});
});
