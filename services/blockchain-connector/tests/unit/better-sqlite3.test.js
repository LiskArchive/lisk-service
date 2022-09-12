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
	// startDbTransaction,
	// commitDbTransaction,
	// getDbConnection,
	// rollbackDbTransaction,
} = require('../../shared/database/better-sqlite3');

const schema = require('../constants/blocksSchema');

const tableName = 'functional_test';

const getIndex = () => getTableInstance(tableName, schema);

const { block, blockWithTransaction } = require('../constants/blocks');

describe('Test MySQL', () => {
	let testTable;

	beforeAll(async () => {
		// Create table
		testTable = await getIndex();
	});

	afterAll(async () => {
		// Drop table
		// await testTable.rawQuery(`DROP TABLE ${tableName}`);
	});

	describe('Generic MySQL validation', () => {
		it(`${tableName} exists`, async () => {
			const result = await testTable.find();
			expect(result.length).toBe(0);
		});
	});

	describe('With IMPLICIT DB transaction (auto-commit mode)', () => {
		it('Insert row', async () => {
			await testTable.upsert([block.header]);
			const result = await testTable.find();
			expect(result.length).toBe(1);
		});

		it('Fetch rows', async () => {
			const { id } = block.header;
			const result = await testTable.find({ id }, ['id']);
			expect(result.length).toBe(1);

			const [retrievedBlock] = result;
			expect(retrievedBlock.id).toBe(id);
		});

		it('Update row', async () => {
			const { id } = blockWithTransaction.header;
			await testTable.upsert([{ ...blockWithTransaction.header, height: 10 }]);

			const [retrievedBlock] = await testTable.find({ id }, ['id', 'height']);
			expect(retrievedBlock.id).toBe(id);
			expect(retrievedBlock.height).toBe(10);
		});

		it('Row count', async () => {
			const count = await testTable.count();
			expect(count).toBe(2);
		});

		it('Conditional row count', async () => {
			const { id } = blockWithTransaction.header;
			const count = await testTable.count({ id });
			expect(count).toEqual(1);
		});

		it('Increase column value', async () => {
			const { id } = block.header;
			await testTable.increment({
				increment: { timestamp: 5 },
				where: { id },
			});

			const [retrievedBlock] = await testTable.find({ id }, ['timestamp']);
			expect(retrievedBlock).toBeTruthy();
			expect(retrievedBlock.timestamp).toBe(5 + block.header.timestamp);
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
			await testTable.upsert([block.header, blockWithTransaction.header]);
			const existingBlock = await testTable.find({}, ['id']);
			const existingBlockCount = await testTable.count();

			const existingIds = existingBlock.map(e => e.id);
			const numAffectedRows = await testTable.delete({ whereIn: { property: 'id', values: existingIds } });
			expect(numAffectedRows).toEqual(existingBlockCount);

			const count = await testTable.count({});
			expect(count).toBe(0);
		});

		it('Delete row', async () => {
			await testTable.upsert([block.header]);
			const existingBlock = await testTable.find({}, ['id']);
			const existingBlockCount = await testTable.count();

			const existingId = existingBlock.map(e => e.id);
			const numAffectedRows = await testTable.delete({ whereIn: { property: 'id', values: existingId } });
			expect(numAffectedRows).toEqual(existingBlockCount);

			const count = await testTable.count({});
			expect(count).toBe(0);
		});

		it('Batch row insert', async () => {
			await testTable.upsert([block.header, blockWithTransaction.header]);
			const result = await testTable.find();
			expect(result.length).toBe(2);
		});
	});
});
