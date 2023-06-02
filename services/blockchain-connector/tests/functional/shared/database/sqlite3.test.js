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
const { rm } = require('../../../../shared/utils/fs');

const {
	getTableInstance,
	startDBTransaction,
	commitDBTransaction,
	getDBConnection,
} = require('../../../../shared/database/sqlite3');

const schema = require('../../../constants/blocksSchema');

const tableName = 'functional_test';
const testDir = 'testDir';
schema.tableName = tableName;

const getTable = () => getTableInstance(schema, testDir);

const { blockWithoutTransaction, blockWithTransaction } = require('../../../constants/blocks');

describe('Test sqlite3 implementation', () => {
	let testTable;

	beforeAll(async () => {
		// Create table
		testTable = await getTable();
	});

	afterAll(async () => {
		// Drop table
		await rm(`${process.cwd()}/${testDir}`, { recursive: true });
	});

	describe('Generic MySQL validation', () => {
		it(`${tableName} exists`, async () => {
			const result = await testTable.find();
			expect(result.length).toBe(0);
		});
	});

	describe('With IMPLICIT DB transaction (auto-commit mode)', () => {
		afterAll(() => testTable.rawQuery(`DELETE FROM ${tableName}`));

		it('should insert row', async () => {
			const preUpsertResult = await testTable.find();
			expect(preUpsertResult.length).toBe(0);
			await testTable.upsert([blockWithoutTransaction.header]);
			const postUpsertResult = await testTable.find();
			expect(postUpsertResult.length).toBe(1);
		});

		it('should fetch row', async () => {
			const { id } = blockWithoutTransaction.header;
			const result = await testTable.find({ id }, ['id']);
			expect(result.length).toBe(1);

			const [retrievedBlock] = result;
			expect(retrievedBlock.id).toBe(id);
		});

		it('should update row', async () => {
			const { id } = blockWithTransaction.header;
			await testTable.upsert([{ ...blockWithTransaction.header, height: 10 }]);

			const [retrievedBlock] = await testTable.find({ id }, ['id', 'height']);
			expect(retrievedBlock.id).toBe(id);
			expect(retrievedBlock.height).toBe(10);
		});

		it('should return row count without params', async () => {
			const count = await testTable.count();
			expect(count).toBe(2);
		});

		it('should return row count by params', async () => {
			const { id } = blockWithTransaction.header;
			const count = await testTable.count({ id });
			expect(count).toEqual(1);
		});

		it('should increment column value', async () => {
			const { id } = blockWithoutTransaction.header;
			await testTable.increment({
				increment: { timestamp: 5 },
				where: { id },
			});

			const [retrievedBlock] = await testTable.find({ id }, ['timestamp']);
			expect(retrievedBlock).toBeTruthy();
			expect(retrievedBlock.timestamp).toBe(5 + blockWithoutTransaction.header.timestamp);
		});

		it('should delete row by primary key', async () => {
			const [existingBlock] = await testTable.find();
			const existingBlockId = existingBlock[`${schema.primaryKey}`];
			const count = await testTable.deleteByPrimaryKey([existingBlockId]);
			expect(count).toEqual(1);

			const result = await testTable.find({ [schema.primaryKey]: existingBlock[schema.primaryKey] }, ['id']);
			expect(result.length).toBe(0);
			expect(result.every(b => b.id !== existingBlock.id)).toBeTruthy();
		});

		it('should delete rows', async () => {
			await testTable.upsert([blockWithoutTransaction.header, blockWithTransaction.header]);
			const existingBlock = await testTable.find({}, ['id']);
			const existingBlockCount = await testTable.count();

			const existingIds = existingBlock.map(e => e.id);
			const numAffectedRows = await testTable.delete({ whereIn: { property: 'id', values: existingIds } });
			expect(numAffectedRows).toEqual(existingBlockCount);

			const count = await testTable.count({});
			expect(count).toBe(0);
		});

		it('should delete row', async () => {
			await testTable.upsert([blockWithoutTransaction.header]);
			const existingBlock = await testTable.find({}, ['id']);
			const existingBlockCount = await testTable.count();

			const existingId = existingBlock.map(e => e.id);
			const numAffectedRows = await testTable.delete({ whereIn: { property: 'id', values: existingId } });
			expect(numAffectedRows).toEqual(existingBlockCount);

			const count = await testTable.count({});
			expect(count).toBe(0);
		});

		it('should insert rows in a batch', async () => {
			const preUpsertResult = await testTable.find();
			expect(preUpsertResult.length).toBe(0);
			await testTable.upsert([blockWithoutTransaction.header, blockWithTransaction.header]);
			const postUpsertResult = await testTable.find();
			expect(postUpsertResult.length).toBe(2);
		});
	});

	describe('With EXPLICIT DB transaction (non-auto commit mode)', () => {
		afterAll(() => testTable.rawQuery(`DELETE FROM ${tableName}`));

		it('should insert row', async () => {
			const preUpsertResult = await testTable.find();
			expect(preUpsertResult.length).toBe(0);
			const connection = await getDBConnection(tableName);
			const trx = await startDBTransaction(connection);
			await testTable.upsert([blockWithoutTransaction.header], trx);
			await commitDBTransaction(trx);
			const postUpsertResult = await testTable.find();
			expect(postUpsertResult.length).toBe(1);
		});

		it('should fetch row', async () => {
			const { id } = blockWithoutTransaction.header;
			const result = await testTable.find({ id }, ['id']);
			expect(result.length).toBe(1);

			const [retrievedBlock] = result;
			expect(retrievedBlock.id).toBe(id);
		});

		it('should update row', async () => {
			const connection = await getDBConnection(tableName);
			const trx = await startDBTransaction(connection);
			const { id } = blockWithTransaction.header;
			await testTable.upsert([{ ...blockWithTransaction.header, height: 20 }], trx);
			await commitDBTransaction(trx);

			const [retrievedBlock] = await testTable.find({ id }, ['id', 'height']);
			expect(retrievedBlock.id).toBe(id);
			expect(retrievedBlock.height).toBe(20);
		});

		it('should return row count without params', async () => {
			const count = await testTable.count();
			expect(count).toBe(2);
		});

		it('should row count by params', async () => {
			const { id } = blockWithTransaction.header;
			const count = await testTable.count({ id });
			expect(count).toEqual(1);
		});

		it('should increment column value', async () => {
			const connection = await getDBConnection(tableName);
			const trx = await startDBTransaction(connection);
			const { id } = blockWithoutTransaction.header;
			await testTable.increment({
				increment: { timestamp: 5 },
				where: { id },
			}, trx);
			await commitDBTransaction(trx);
			const [retrievedBlock] = await testTable.find({ id }, ['timestamp']);
			expect(retrievedBlock).toBeTruthy();
			expect(retrievedBlock.timestamp).toBe(5 + blockWithoutTransaction.header.timestamp);
		});

		it('should delete row by primary key', async () => {
			const connection = await getDBConnection(tableName);
			const trx = await startDBTransaction(connection);
			const [existingBlock] = await testTable.find();
			const existingBlockId = existingBlock[`${schema.primaryKey}`];
			const numAffectedRows = await testTable.deleteByPrimaryKey([existingBlockId], trx);
			await commitDBTransaction(trx);
			expect(numAffectedRows).toEqual(1);

			const count = await testTable.count({
				[schema.primaryKey]: existingBlock[schema.primaryKey],
			});
			expect(count).toBe(0);
		});

		it('should delete rows', async () => {
			const connection = await getDBConnection(tableName);
			const trx = await startDBTransaction(connection);

			await testTable.upsert([blockWithoutTransaction.header, blockWithTransaction.header]);
			const existingBlock = await testTable.find({}, ['id']);
			const existingBlockCount = await testTable.count();

			const existingIds = existingBlock.map(e => e.id);
			const numAffectedRows = await testTable.delete({ whereIn: { property: 'id', values: existingIds } }, trx);
			await commitDBTransaction(trx);

			expect(numAffectedRows).toEqual(existingBlockCount);

			const count = await testTable.count({});
			expect(count).toBe(0);
		});

		it('should delete row', async () => {
			const connection = await getDBConnection(tableName);
			const trx = await startDBTransaction(connection);

			await testTable.upsert([blockWithoutTransaction.header]);
			const existingBlock = await testTable.find({}, ['id']);
			const existingBlockCount = await testTable.count();

			const existingId = existingBlock.map(e => e.id);
			const numAffectedRows = await testTable.delete({ whereIn: { property: 'id', values: existingId } }, trx);
			await commitDBTransaction(trx);

			expect(numAffectedRows).toEqual(existingBlockCount);

			const count = await testTable.count({});
			expect(count).toBe(0);
		});

		it('should insert rows in a batch', async () => {
			const connection = await getDBConnection(tableName);
			const trx = await startDBTransaction(connection);
			const preUpsertResult = await testTable.find();
			expect(preUpsertResult.length).toBe(0);
			await testTable.upsert([blockWithoutTransaction.header, blockWithTransaction.header], trx);
			await commitDBTransaction(trx);
			const postUpsertResult = await testTable.find();
			expect(postUpsertResult.length).toBe(2);
		});
	});
});
