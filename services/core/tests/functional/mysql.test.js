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
const {
	getTableInstance,
	startDbTransaction,
	commitDbTransaction,
	getDbConnection,
	rollbackDbTransaction,
} = require('../../shared/indexdb/mysql');
const schema = require('../constants/blocksSchema');

const tableName = 'functional_test';
const getIndex = () => getTableInstance(tableName, schema);

const { emptyBlock, nonEmptyBlock } = require('../constants/blocks');

describe('Test MySQL', () => {
	let testTable;
	beforeAll(async () => {
		// Create table
		testTable = await getIndex();
	});

	afterAll(async () => {
		// Drop table
		await testTable.rawQuery(`DROP TABLE IF EXISTS ${tableName}`);
	});

	it(`${tableName} exists`, async () => {
		const result = await testTable.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(0);
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

		it('Update row', async () => {
			await testTable.upsert([{ ...emptyBlock, size: 50 }]);

			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['id', 'size']);
			expect(retrievedBlock.id).toBe(emptyBlock.id);
			expect(retrievedBlock.size).toBe(50);
		});

		it('Row count', async () => {
			const count = await testTable.count();
			expect(count).toBe(1);
		});

		it('Conditional row count', async () => {
			const count = await testTable.count({ id: nonEmptyBlock.id });
			expect(count).toEqual(0);
		});

		it('Increase column value', async () => {
			await testTable.increment({
				increment: { timestamp: 5 },
				where: {
					property: 'id',
					value: emptyBlock.id,
				},
			});

			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			expect(retrievedBlock).toBeTruthy();
			expect(retrievedBlock.timestamp).toBe(5 + emptyBlock.timestamp);
		});

		it('Delete row by id', async () => {
			const [existingBlock] = await testTable.find();
			const existingBlockId = existingBlock[`${schema.primaryKey}`];
			const count = await testTable.deleteIds([existingBlockId]);
			expect(count).toEqual(1);

			const result = await testTable.find({ [schema.primaryKey]: existingBlock[schema.primaryKey] }, ['id']);
			expect(result.length).toBe(0);
			expect(result.every(b => b.id !== existingBlock.id)).toBeTruthy();
		});

		it('Batch row insert', async () => {
			await testTable.upsert([emptyBlock, nonEmptyBlock]);
			const result = await testTable.find();
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(2);
		});
	});

	describe('With EXPLICIT DB transaction (non-auto commit mode)', () => {
		afterAll(() => testTable.rawQuery(`TRUNCATE ${tableName}`));

		it('Insert row', async () => {
			const connection = await getDbConnection();
			const trx = await startDbTransaction(connection);
			await testTable.upsert([emptyBlock], trx);
			await commitDbTransaction(trx);
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

		it('Update row', async () => {
			const connection = await getDbConnection();
			const trx = await startDbTransaction(connection);
			await testTable.upsert([{ ...emptyBlock, size: 50 }], trx);
			await commitDbTransaction(trx);
			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['id', 'size']);
			expect(retrievedBlock.id).toBe(emptyBlock.id);
			expect(retrievedBlock.size).toBe(50);
		});

		it('Row count', async () => {
			const count = await testTable.count();
			expect(count).toBe(1);
		});

		it('Conditional row count', async () => {
			const count = await testTable.count({ id: nonEmptyBlock.id });
			expect(count).toEqual(0);
		});

		it('Increase column value', async () => {
			const connection = await getDbConnection();
			const trx = await startDbTransaction(connection);
			await testTable.increment({
				increment: { timestamp: 5 },
				where: {
					property: 'id',
					value: emptyBlock.id,
				},
			}, trx);
			await commitDbTransaction(trx);
			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['timestamp']);
			expect(retrievedBlock).toBeTruthy();
			expect(retrievedBlock.timestamp).toBe(5 + emptyBlock.timestamp);
		});

		it('Delete row by id', async () => {
			const connection = await getDbConnection();
			const trx = await startDbTransaction(connection);
			const [existingBlock] = await testTable.find();
			const existingBlockId = existingBlock[`${schema.primaryKey}`];
			const count = await testTable.deleteIds([existingBlockId], trx);
			await commitDbTransaction(trx);
			expect(count).toEqual(1);

			const result = await testTable.find({ [schema.primaryKey]: existingBlock[schema.primaryKey] }, ['id']);
			expect(result.length).toBe(0);
			expect(result.every(b => b.id !== existingBlock.id)).toBeTruthy();
		});

		it('Batch row insert', async () => {
			const connection = await getDbConnection();
			const trx = await startDbTransaction(connection);
			await testTable.upsert([emptyBlock, nonEmptyBlock], trx);
			await commitDbTransaction(trx);
			const result = await testTable.find();
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(2);
		});
	});

	describe('Transactional atomicity guarantees (non-auto commit mode)', () => {
		it('Successful transaction commit', async () => {
			const connection = await getDbConnection();
			const trx = await startDbTransaction(connection);
			await testTable.upsert([emptyBlock], trx);
			await testTable.upsert([{ ...emptyBlock, size: 50 }], trx);

			// Expect all operations to be successful, commit the transaction
			await commitDbTransaction(trx);

			// Verify committed transaction has been successful
			const [retrievedBlock] = await testTable.find({ id: emptyBlock.id }, ['id', 'size']);
			expect(retrievedBlock.id).toBe(emptyBlock.id);
			expect(retrievedBlock.size).toBe(50);
		});

		it('Successful transaction rollback', async () => {
			const connection = await getDbConnection();
			const trx = await startDbTransaction(connection);
			await testTable.upsert([{ ...emptyBlock, id: 'rollback' }], trx);
			await testTable.increment({
				increment: { size: 100 },
				where: {
					property: 'id',
					value: 'rollback',
				},
			}, trx);

			// Assume failure occured, rollback the transaction
			await rollbackDbTransaction(trx);

			// Verify none of the above operations have been committed
			const [retrievedBlock] = await testTable.find({ id: 'rollback' }, ['id']);
			expect(retrievedBlock).toBeUndefined();
		});

		it('Additional operational on committed transaction throws error', async () => {
			const connection = await getDbConnection();
			const trx = await startDbTransaction(connection);
			await testTable.upsert([emptyBlock], trx);
			await testTable.upsert([{ ...emptyBlock, size: 50 }], trx);

			// Expect all operations to be successful, commit the transaction
			await commitDbTransaction(trx);

			// Perform upsert using committed transaction
			expect(testTable.upsert([{ ...emptyBlock, id: 'same transaction' }], trx)).rejects.toThrow();
		});

		it('Additional operational on rollback transaction throws error', async () => {
			const connection = await getDbConnection();
			const trx = await startDbTransaction(connection);
			await testTable.upsert([emptyBlock], trx);
			await testTable.upsert([{ ...emptyBlock, size: 50 }], trx);

			// Assume failure occured, rollback the transaction
			await rollbackDbTransaction(trx);

			// Perform upsert using rollback transaction
			expect(testTable.upsert([{ ...emptyBlock, id: 'same transaction' }], trx)).rejects.toThrow();
		});

		it('Rolling back a committed transaction has no effect', async () => {
			const connection = await getDbConnection();
			const trx = await startDbTransaction(connection);
			await testTable.upsert([emptyBlock], trx);
			await testTable.upsert([{ ...emptyBlock, size: 50 }], trx);

			// Expect all operations to be successful, commit the transaction
			await commitDbTransaction(trx);
			expect(rollbackDbTransaction(trx)).resolves.toBeUndefined();
		});
	});
});
