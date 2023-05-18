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
	MySQL: {
		getDBConnection,
		startDBTransaction,
		commitDBTransaction,
	},
	MySQLKVStore: {
		getKeyValueTable,
	},
} = require('lisk-service-framework');
const { ServiceBroker } = require('moleculer');

const { KV_STORE_KEY } = require('../../../shared/constants');

const request = require('../../../shared/utils/request');
const config = require('../../../config');
const { getPosTokenID } = require('../../../shared/dataService/business/pos/constants');
const {
	indexTokenModuleAssets,
	indexPosModuleAssets,
	indexGenesisBlockAssets,
} = require('../../../shared/indexer/genesisBlock');

const MYSQL_ENDPOINT = config.endpoints.mysql;
const getKeyValueTableInstance = () => getKeyValueTable(config.kvStoreTableName, MYSQL_ENDPOINT);

const broker = new ServiceBroker({
	transporter: config.transporter,
	logLevel: 'warn',
	requestTimeout: 15 * 1000,
	logger: console,
});
let connection;
let totalLockedKey;
let totalStakedKey;
let totalSelfStakedKey;
let keyValueTable;

beforeAll(async () => {
	keyValueTable = await getKeyValueTableInstance();
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

	connection = await getDBConnection(MYSQL_ENDPOINT);

	const tokenID = await getPosTokenID();
	totalLockedKey = KV_STORE_KEY.PREFIX.TOTAL_LOCKED.concat(tokenID);
	totalStakedKey = KV_STORE_KEY.PREFIX.TOTAL_STAKED.concat(tokenID);
	totalSelfStakedKey = KV_STORE_KEY.PREFIX.TOTAL_SELF_STAKED.concat(tokenID);
});
afterAll(() => broker.stop());

xdescribe('Test indexTokenModuleAssets method', () => {
	beforeEach(async () => {
		await keyValueTable.delete(totalLockedKey);
	});

	it('should correctly index Token Module Asset', async () => {
		const totalLockedBefore = await keyValueTable.get(totalLockedKey);
		expect(totalLockedBefore).toBe(undefined);

		await indexTokenModuleAssets();

		const totalLockedAfter = await keyValueTable.get(totalLockedKey);
		expect(totalLockedAfter > BigInt(0)).toEqual(true);
	});

	it('should correctly index Token Module Asset only after commit when called with dbTrx', async () => {
		const dbTrx = await startDBTransaction(connection);
		const totalLockedBefore = await keyValueTable.get(totalLockedKey);
		expect(totalLockedBefore).toBe(undefined);

		await indexTokenModuleAssets(dbTrx);
		const totalLockedBeforeCommit = await keyValueTable.get(totalLockedKey);
		expect(totalLockedBeforeCommit).toBe(undefined);

		await commitDBTransaction(dbTrx);
		const totalLockedAfter = await keyValueTable.get(totalLockedKey);
		expect(totalLockedAfter > BigInt(0)).toEqual(true);
	});
});

xdescribe('Test indexPosModuleAssets method', () => {
	beforeEach(async () => {
		await keyValueTable.delete(totalStakedKey);
		await keyValueTable.delete(totalSelfStakedKey);
	});

	it('should correctly index PoS Module Asset', async () => {
		const totalStakedBefore = await keyValueTable.get(totalStakedKey);
		expect(totalStakedBefore).toBe(undefined);
		const totalSelfStakedBefore = await keyValueTable.get(totalSelfStakedKey);
		expect(totalSelfStakedBefore).toBe(undefined);

		await indexPosModuleAssets();
		const totalStakedAfter = await keyValueTable.get(totalStakedKey);
		expect(totalStakedAfter > BigInt(0)).toEqual(true);
		const totalSelfStakedAfter = await keyValueTable.get(totalSelfStakedKey);
		expect(totalSelfStakedAfter > BigInt(0)).toEqual(true);
	});

	it('should correctly index Token Module Asset only after commit when called with dbTrx', async () => {
		const dbTrx = await startDBTransaction(connection);
		const totalStakedBefore = await keyValueTable.get(totalStakedKey);
		expect(totalStakedBefore).toBe(undefined);
		const totalSelfStakedBefore = await keyValueTable.get(totalSelfStakedKey);
		expect(totalSelfStakedBefore).toBe(undefined);

		await indexPosModuleAssets(dbTrx);
		const totalStakedBeforeCommit = await keyValueTable.get(totalStakedKey);
		expect(totalStakedBeforeCommit).toBe(undefined);
		const totalSelfStakedBeforeCommit = await keyValueTable.get(totalSelfStakedKey);
		expect(totalSelfStakedBeforeCommit).toBe(undefined);

		await commitDBTransaction(dbTrx);
		const totalStakedAfter = await keyValueTable.get(totalStakedKey);
		expect(totalStakedAfter > BigInt(0)).toEqual(true);
		const totalSelfStakedAfter = await keyValueTable.get(totalSelfStakedKey);
		expect(totalSelfStakedAfter > BigInt(0)).toEqual(true);
	});
});

xdescribe('Test indexGenesisBlockAssets method', () => {
	beforeEach(async () => {
		await keyValueTable.delete(totalLockedKey);
		await keyValueTable.delete(totalStakedKey);
		await keyValueTable.delete(totalSelfStakedKey);
	});

	it('should correctly index genesis block assets', async () => {
		const totalLockedBefore = await keyValueTable.get(totalLockedKey);
		expect(totalLockedBefore).toBe(undefined);
		const totalStakedBefore = await keyValueTable.get(totalStakedKey);
		expect(totalStakedBefore).toBe(undefined);
		const totalSelfStakedBefore = await keyValueTable.get(totalSelfStakedKey);
		expect(totalSelfStakedBefore).toBe(undefined);

		await indexGenesisBlockAssets();
		const totalLockedAfter = await keyValueTable.get(totalLockedKey);
		expect(totalLockedAfter > BigInt(0)).toEqual(true);
		const totalStakedAfter = await keyValueTable.get(totalStakedKey);
		expect(totalStakedAfter > BigInt(0)).toEqual(true);
		const totalSelfStakedAfter = await keyValueTable.get(totalSelfStakedKey);
		expect(totalSelfStakedAfter > BigInt(0)).toEqual(true);
	});

	it('should correctly index genesis block assets only after commit when called with dbTrx', async () => {
		const dbTrx = await startDBTransaction(connection);
		const totalLockedBefore = await keyValueTable.get(totalLockedKey);
		expect(totalLockedBefore).toBe(undefined);
		const totalStakedBefore = await keyValueTable.get(totalStakedKey);
		expect(totalStakedBefore).toBe(undefined);
		const totalSelfStakedBefore = await keyValueTable.get(totalSelfStakedKey);
		expect(totalSelfStakedBefore).toBe(undefined);

		await indexGenesisBlockAssets(dbTrx);
		const totalLockedBeforeCommit = await keyValueTable.get(totalLockedKey);
		expect(totalLockedBeforeCommit).toBe(undefined);
		const totalStakedBeforeCommit = await keyValueTable.get(totalStakedKey);
		expect(totalStakedBeforeCommit).toBe(undefined);
		const totalSelfStakedBeforeCommit = await keyValueTable.get(totalSelfStakedKey);
		expect(totalSelfStakedBeforeCommit).toBe(undefined);

		await commitDBTransaction(dbTrx);
		const totalLockedAfter = await keyValueTable.get(totalLockedKey);
		expect(totalLockedAfter > BigInt(0)).toEqual(true);
		const totalStakedAfter = await keyValueTable.get(totalStakedKey);
		expect(totalStakedAfter > BigInt(0)).toEqual(true);
		const totalSelfStakedAfter = await keyValueTable.get(totalSelfStakedKey);
		expect(totalSelfStakedAfter > BigInt(0)).toEqual(true);
	});
});
