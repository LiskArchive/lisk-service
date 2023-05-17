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
	getTableInstance,
	startDBTransaction,
	commitDBTransaction,
	getDBConnection,
	rollbackDBTransaction,
} = require('../../src/mysql');

const schema = require('../constants/blocksSchema');
const compositeKeySchema = require('../constants/compositeKeySchema');

const tableName = 'functional_test';
const compositeKeyTableName = 'composite_primary_key';

schema.tableName = tableName;
compositeKeySchema.tableName = compositeKeyTableName;

const getIndex = () => getTableInstance(schema);
const getCompositeKeyTableIndex = () => getTableInstance(compositeKeySchema);

const { emptyBlock, nonEmptyBlock } = require('../constants/blocks');

describe('Test MySQL', () => {
	let testTable;
	let compositeKeyTable;
	beforeAll(async () => {
		// Create table
		testTable = await getIndex();
		compositeKeyTable = await getCompositeKeyTableIndex();
	});

	afterAll(async () => {
		// Drop table
		await testTable.rawQuery(`DROP TABLE IF EXISTS ${tableName}`);
		await compositeKeyTable.rawQuery(`DROP TABLE IF EXISTS ${compositeKeyTableName}`);
	});

	describe('Generic MySQL validation', () => {
		it('validate if primary key is set', async () => {
			const result = await testTable.rawQuery(`SHOW KEYS FROM ${tableName} WHERE Key_name = 'PRIMARY'`);
			expect(result.length).toBe(1);
			expect(result[0].Column_name).toBe(schema.primaryKey);
		});

		it('validate if composite primary key is set', async () => {
			const result = await compositeKeyTable.rawQuery(`SHOW KEYS FROM ${compositeKeyTableName} WHERE Key_name = 'PRIMARY'`);
			expect(result.length).toBe(compositeKeySchema.primaryKey.length);
			result
				.forEach(res => expect(compositeKeySchema.primaryKey.includes(res.Column_name)).toBe(true));
		});

		it(`${tableName} exists`, async () => {
			const result = await testTable.find();
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(0);
		});
	});

	describe('With IMPLICIT DB transaction (auto-commit mode)', () => {
		afterAll(() => testTable.rawQuery(`TRUNCATE ${tableName}`));

		it('Insert row', async () => {
			await testTable.upsert([emptyBlock]);
			const result = await testTable.find();
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(1);
		});

		it('Fetch rows', async () => {
			const result = await testTable.find({ id: emptyBlock.id }, ['id']);
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(1);

			const [retrievedBlock] = result;
			expect(retrievedBlock.id).toBe(emptyBlock.id);
		});

		it('Fetch rows using whereIn', async () => {
			await testTable.upsert([emptyBlock, nonEmptyBlock]);
			const params = {
				whereIn: [{
					property: 'height',
					values: [emptyBlock.height, nonEmptyBlock.height],
				},
				{
					property: 'id',
					values: [emptyBlock.id],
				}],
			};
			const result = await testTable.find(params, ['id']);
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(1);

			const [retrievedBlock] = result;
			expect(retrievedBlock.id).toBe(emptyBlock.id);
		});

		it('Update row', async () => {
			await testTable.upsert([{ ...emptyBlock, size: 50 }]);

			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['id', 'size']);
			expect(retrievedBlock.id).toBe(emptyBlock.id);
			expect(retrievedBlock.size).toBe(50);
		});

		it('Row count', async () => {
			const count = await testTable.count();
			expect(count).toBe(2);
		});

		it('Row count using whereIn', async () => {
			await testTable.upsert([emptyBlock, nonEmptyBlock]);
			const params = {
				whereIn: [{
					property: 'height',
					values: [emptyBlock.height, nonEmptyBlock.height],
				},
				{
					property: 'id',
					values: [emptyBlock.id],
				}],
			};
			const result = await testTable.count(params);
			expect(result).toBe(1);
		});

		it('Conditional row count', async () => {
			const count = await testTable.count({ id: 'not_existing_id' });
			expect(count).toEqual(0);
		});

		it('Increase column value', async () => {
			const [currentBlock] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			const currentTimestamp = currentBlock.timestamp;

			await testTable.increment({
				increment: { timestamp: 5 },
				where: { id: emptyBlock.id },
			});

			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			expect(retrievedBlock).toBeTruthy();
			expect(retrievedBlock.timestamp).toBe(5 + currentTimestamp);
		});

		it('Decrease column value', async () => {
			const [currentBlock] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			const currentTimestamp = currentBlock.timestamp;

			await testTable.decrement({
				decrement: { timestamp: 5 },
				where: { id: emptyBlock.id },
			});

			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			expect(retrievedBlock).toBeTruthy();
			expect(retrievedBlock.timestamp).toBe(currentTimestamp - 5);
		});

		it('Delete row by primary key', async () => {
			const [existingBlock] = await testTable.find();
			const existingBlockId = existingBlock[`${schema.primaryKey}`];
			const count = await testTable.deleteByPrimaryKey([existingBlockId]);
			expect(count).toEqual(1);

			const result = await testTable.find({ [schema.primaryKey]: existingBlock[schema.primaryKey] }, ['id']);
			expect(result.length).toBe(0);
			expect(result.every(b => b.id !== existingBlock.id)).toBeTruthy();
		});

		it('Delete rows', async () => {
			await testTable.upsert([emptyBlock, nonEmptyBlock]);
			const existingBlock = await testTable.find({}, ['id']);
			const existingBlockCount = await testTable.count();

			const existingIds = existingBlock.map(block => block.id);
			const numAffectedRows = await testTable.delete({ whereIn: { property: 'id', values: existingIds } });
			expect(numAffectedRows).toEqual(existingBlockCount);

			const count = await testTable.count({});
			expect(count).toBe(0);
		});

		it('Delete row', async () => {
			await testTable.upsert([emptyBlock]);
			const existingBlock = await testTable.find({}, ['id']);
			const existingBlockCount = await testTable.count();

			const existingId = existingBlock.map(block => block.id);
			const numAffectedRows = await testTable.delete({ whereIn: { property: 'id', values: existingId } });
			expect(numAffectedRows).toEqual(existingBlockCount);

			const count = await testTable.count({});
			expect(count).toBe(0);
		});

		it('Batch row insert', async () => {
			await testTable.upsert([emptyBlock, nonEmptyBlock]);
			const result = await testTable.find();
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(2);
		});

		it('Distinct query', async () => {
			await testTable.upsert([emptyBlock, { ...nonEmptyBlock, id: emptyBlock.id }]);
			const result = await testTable.find();
			const distinctResult = await testTable.find({ distinct: 'id' }, 'id');
			expect(result.length).toBeGreaterThan(distinctResult.length);
		});

		it('Update method', async () => {
			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			expect(retrievedBlock.timestamp).toBe(emptyBlock.timestamp);

			const params = {
				where: { height: emptyBlock.height },
				updates: { timestamp: emptyBlock.timestamp + 1000 },
			};

			await testTable.update(params);

			const [retrievedBlock1] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			expect(retrievedBlock1.timestamp).toBe(params.updates.timestamp);
		});
	});

	describe('With EXPLICIT DB transaction (non-auto commit mode)', () => {
		afterAll(() => testTable.rawQuery(`TRUNCATE ${tableName}`));

		it('Insert row', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([emptyBlock], trx);
			await commitDBTransaction(trx);
			const result = await testTable.find();
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(1);
		});

		it('Fetch rows', async () => {
			const result = await testTable.find({ id: emptyBlock.id }, ['id']);
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(1);

			const [retrievedBlock] = result;
			expect(retrievedBlock.id).toBe(emptyBlock.id);
		});

		it('Fetch rows using whereIn', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([emptyBlock, nonEmptyBlock], trx);
			await commitDBTransaction(trx);

			const params = {
				whereIn: [{
					property: 'height',
					values: [emptyBlock.height, nonEmptyBlock.height],
				},
				{
					property: 'id',
					values: [emptyBlock.id],
				}],
			};
			const result = await testTable.find(params, ['id']);
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(1);

			const [retrievedBlock] = result;
			expect(retrievedBlock.id).toBe(emptyBlock.id);
		});

		it('Update row', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([{ ...emptyBlock, size: 50 }], trx);
			await commitDBTransaction(trx);
			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['id', 'size']);
			expect(retrievedBlock.id).toBe(emptyBlock.id);
			expect(retrievedBlock.size).toBe(50);
		});

		it('Row count', async () => {
			const count = await testTable.count();
			expect(count).toBe(2);
		});

		it('Row count using whereIn', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([emptyBlock, nonEmptyBlock], trx);
			await commitDBTransaction(trx);

			const params = {
				whereIn: [{
					property: 'height',
					values: [emptyBlock.height, nonEmptyBlock.height],
				},
				{
					property: 'id',
					values: [emptyBlock.id],
				}],
			};
			const result = await testTable.count(params);
			expect(result).toBe(1);
		});

		it('Conditional row count', async () => {
			const count = await testTable.count({ id: 'not_existing_id' });
			expect(count).toEqual(0);
		});

		it('Increase column value', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.increment({
				increment: { timestamp: 5 },
				where: { id: emptyBlock.id },
			}, trx);
			await commitDBTransaction(trx);
			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			expect(retrievedBlock).toBeTruthy();
			expect(retrievedBlock.timestamp).toBe(5 + emptyBlock.timestamp);
		});

		it('Delete row by primary key', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			const [existingBlock] = await testTable.find();
			const existingBlockId = existingBlock[`${schema.primaryKey}`];
			const numAffectedRows = await testTable.deleteByPrimaryKey([existingBlockId], trx);
			await commitDBTransaction(trx);
			expect(numAffectedRows).toEqual(1);

			const count = await testTable
				.count({ [schema.primaryKey]: existingBlock[schema.primaryKey] });
			expect(count).toBe(0);
		});

		it('Delete rows', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);

			await testTable.upsert([emptyBlock, nonEmptyBlock]);
			const existingBlock = await testTable.find({}, ['id']);
			const existingBlockCount = await testTable.count();

			const existingIds = existingBlock.map(block => block.id);
			const numAffectedRows = await testTable.delete({ whereIn: { property: 'id', values: existingIds } }, trx);
			await commitDBTransaction(trx);

			expect(numAffectedRows).toEqual(existingBlockCount);

			const count = await testTable.count({});
			expect(count).toBe(0);
		});

		it('Delete row', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);

			await testTable.upsert([emptyBlock]);
			const existingBlock = await testTable.find({}, ['id']);
			const existingBlockCount = await testTable.count();

			const existingId = existingBlock.map(block => block.id);
			const numAffectedRows = await testTable.delete({ whereIn: { property: 'id', values: existingId } }, trx);
			await commitDBTransaction(trx);

			expect(numAffectedRows).toEqual(existingBlockCount);

			const count = await testTable.count({});
			expect(count).toBe(0);
		});

		it('Batch row insert', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([emptyBlock, nonEmptyBlock], trx);
			await commitDBTransaction(trx);
			const result = await testTable.find();
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(2);
		});

		it('Distinct query', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([emptyBlock, { ...nonEmptyBlock, id: emptyBlock.id }], trx);
			await commitDBTransaction(trx);
			const result = await testTable.find();
			const distinctResult = await testTable.find({ distinct: 'id' }, 'id');
			expect(result.length).toBeGreaterThan(distinctResult.length);
		});

		it('Update method', async () => {
			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			expect(retrievedBlock.timestamp).toBe(emptyBlock.timestamp);

			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);

			const params = {
				where: { height: emptyBlock.height },
				updates: { timestamp: emptyBlock.timestamp + 1000 },
			};

			await testTable.update(params, trx);
			await commitDBTransaction(trx);

			const [retrievedBlock1] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			expect(retrievedBlock1.timestamp).toBe(params.updates.timestamp);
		});
	});

	describe('Transactional atomicity guarantees (non-auto commit mode)', () => {
		it('Successful transaction commit', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([emptyBlock], trx);
			await testTable.upsert([{ ...emptyBlock, size: 50 }], trx);

			// Expect all operations to be successful, commit the transaction
			await commitDBTransaction(trx);

			// Verify committed transaction has been successful
			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['id', 'size']);
			expect(retrievedBlock.id).toBe(emptyBlock.id);
			expect(retrievedBlock.size).toBe(50);
		});

		it('Successful transaction rollback - 1', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([{ ...emptyBlock, id: 'rollback' }], trx);
			await testTable.increment({
				increment: { size: 100 },
				where: { id: 'rollback' },
			}, trx);

			// Assume failure occurred, rollback the transaction
			await rollbackDBTransaction(trx);

			// Verify none of the above operations have been committed
			const [retrievedBlock] = await testTable.find({ id: 'rollback' }, ['id']);
			expect(retrievedBlock).toBeUndefined();
		});

		it('Successful transaction rollback - 2', async () => {
			const height = 14555;
			const connection = await getDBConnection();
			const trx1 = await startDBTransaction(connection);
			const trx2 = await startDBTransaction(connection);
			await testTable.upsert([{ ...emptyBlock, height }], trx1);
			await commitDBTransaction(trx1);

			// Start a new transaction, perform upsert/delete and rollback
			await testTable
				.upsert([{ ...emptyBlock, height, timestamp: emptyBlock.timestamp + 100 }], trx2);
			const numRowsAffected = await testTable.deleteByPrimaryKey([height], trx2);
			expect(numRowsAffected).toEqual(1);

			await rollbackDBTransaction(trx2);

			// The row must still be available
			const [retrievedBlock2] = await testTable.find({ height }, ['height', 'timestamp']);
			expect(retrievedBlock2.height).toBe(height);
			expect(retrievedBlock2.timestamp).toBe(emptyBlock.timestamp);
		});

		it('Additional operational on committed transaction throws error', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([emptyBlock], trx);
			await testTable.upsert([{ ...emptyBlock, size: 50 }], trx);

			// Expect all operations to be successful, commit the transaction
			await commitDBTransaction(trx);

			// Perform upsert using committed transaction
			expect(testTable.upsert([{ ...emptyBlock, id: 'same transaction' }], trx)).rejects.toThrow();
		});

		it('Additional operational on rollback transaction throws error', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([emptyBlock], trx);
			await testTable.upsert([{ ...emptyBlock, size: 50 }], trx);

			// Assume failure occurred, rollback the transaction
			await rollbackDBTransaction(trx);

			// Perform upsert using rollback transaction
			expect(testTable.upsert([{ ...emptyBlock, id: 'same transaction' }], trx)).rejects.toThrow();
		});

		it('Rolling back a committed transaction has no effect', async () => {
			const connection = await getDBConnection();
			const trx = await startDBTransaction(connection);
			await testTable.upsert([emptyBlock], trx);
			await testTable.upsert([{ ...emptyBlock, size: 50 }], trx);

			// Expect all operations to be successful, commit the transaction
			await commitDBTransaction(trx);
			expect(rollbackDBTransaction(trx)).resolves.toBeUndefined();
		});
	});
});
