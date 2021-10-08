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
} = require('../../shared/indexdb/mysql');
const schema = require('../constants/blocksSchema');

const getIndex = () => getTableInstance('testSchema', schema);

const { emptyBlock, nonEmptyBlock } = require('../constants/blocks');

describe('Test mysql without transaction', () => {
	let db;
	beforeAll(async () => {
		// Create table
		db = await getIndex();
	});

	afterAll(async () => {
		// TODO: Drop table
		const result = await db.find();
		await db.deleteIds(result.map(r => r[`${schema.primaryKey}`]));
	});

	it('DB exists', async () => {
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(0);
	});

	it('Insert row', async () => {
		await db.upsert([emptyBlock]);
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);
	});

	it('Fetch rows', async () => {
		const result = await db.find({ id: emptyBlock.id }, ['id']);
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);

		const [retrievedBlock] = result;
		expect(retrievedBlock.id).toBe(emptyBlock.id);
	});

	it('Update row', async () => {
		await db.upsert([{ ...emptyBlock, size: 50 }]);

		const [retrievedBlock] = await db.find({ id: emptyBlock.id }, ['id', 'size']);
		expect(retrievedBlock.id).toBe(emptyBlock.id);
		expect(retrievedBlock.size).toBe(50);
	});

	it('Row count', async () => {
		const count = await db.count();
		expect(count).toBe(1);
	});

	it('Conditional row count', async () => {
		const count = await db.count({ id: nonEmptyBlock.id });
		expect(count).toEqual(0);
	});

	it('Increase column value', async () => {
		await db.increment({
			increment: { timestamp: 5 },
			where: {
				property: 'id',
				value: emptyBlock.id,
			},
		});

		const [retrievedBlock] = await db.find({ id: emptyBlock.id }, ['timestamp']);
		expect(retrievedBlock).toBeTruthy();
		expect(retrievedBlock.timestamp).toBe(5 + emptyBlock.timestamp);
	});

	it('Delete row by id', async () => {
		const [existingBlock] = await db.find();
		const existingBlockId = existingBlock[`${schema.primaryKey}`];
		const count = await db.deleteIds([existingBlockId]);
		expect(count).toEqual(1);

		const result = await db.find({ [schema.primaryKey]: existingBlock[schema.primaryKey] }, ['id']);
		expect(result.length).toBe(0);
		expect(result.every(b => b.id !== existingBlock.id)).toBeTruthy();
	});

	it('Batch row insert', async () => {
		await db.upsert([emptyBlock, nonEmptyBlock]);
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(2);
	});
});

describe('Test mysql with transaction', () => {
	let db;
	beforeAll(async () => {
		// Create table
		db = await getIndex();
	});

	afterAll(async () => {
		// TODO: Drop table
		const result = await db.find();
		await db.deleteIds(result.map(r => r[`${schema.primaryKey}`]));
	});

	it('DB exists', async () => {
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(0);
	});

	it('Insert row', async () => {
		const connection = await getDbConnection();
		const trx = await startDbTransaction(connection);
		await db.upsert([emptyBlock], trx);
		await commitDbTransaction(trx);
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);
	});

	it('Fetch rows', async () => {
		const result = await db.find({ id: emptyBlock.id }, ['id']);
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);

		const [retrievedBlock] = result;
		expect(retrievedBlock.id).toBe(emptyBlock.id);
	});

	it('Update row', async () => {
		const connection = await getDbConnection();
		const trx = await startDbTransaction(connection);
		await db.upsert([{ ...emptyBlock, size: 50 }], trx);
		await commitDbTransaction(trx);
		const [retrievedBlock] = await db.find({ id: emptyBlock.id }, ['id', 'size']);
		expect(retrievedBlock.id).toBe(emptyBlock.id);
		expect(retrievedBlock.size).toBe(50);
	});

	it('Row count', async () => {
		const count = await db.count();
		expect(count).toBe(1);
	});

	it('Conditional row count', async () => {
		const count = await db.count({ id: nonEmptyBlock.id });
		expect(count).toEqual(0);
	});

	it('Increase column value', async () => {
		const connection = await getDbConnection();
		const trx = await startDbTransaction(connection);
		await db.increment({
			increment: { timestamp: 5 },
			where: {
				property: 'id',
				value: emptyBlock.id,
			},
		}, trx);
		await commitDbTransaction(trx);
		const [retrievedBlock] = await db.find({ id: emptyBlock.id }, ['timestamp']);
		expect(retrievedBlock).toBeTruthy();
		expect(retrievedBlock.timestamp).toBe(5 + emptyBlock.timestamp);
	});

	it('Delete row by id', async () => {
		const connection = await getDbConnection();
		const trx = await startDbTransaction(connection);
		const [existingBlock] = await db.find();
		const existingBlockId = existingBlock[`${schema.primaryKey}`];
		const count = await db.deleteIds([existingBlockId], trx);
		await commitDbTransaction(trx);
		expect(count).toEqual(1);

		const result = await db.find({ [schema.primaryKey]: existingBlock[schema.primaryKey] }, ['id']);
		expect(result.length).toBe(0);
		expect(result.every(b => b.id !== existingBlock.id)).toBeTruthy();
	});

	it('Batch row insert', async () => {
		const connection = await getDbConnection();
		const trx = await startDbTransaction(connection);
		await db.upsert([emptyBlock, nonEmptyBlock], trx);
		await commitDbTransaction(trx);
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(2);
	});
});

describe('Test mysql with multiple operations within one transaction', () => {
	let db;
	beforeAll(async () => {
		// Create table
		db = await getIndex();
	});

	afterAll(async () => {
		// TODO: Drop table
		const result = await db.find();
		await db.deleteIds(result.map(r => r[`${schema.primaryKey}`]));
	});

	it('DB exists', async () => {
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(0);
	});

	it('Insert and update row', async () => {
		const connection = await getDbConnection();
		const trx = await startDbTransaction(connection);
		await db.upsert([emptyBlock], trx);
		await db.upsert([{ ...emptyBlock, size: 50 }], trx);
		await commitDbTransaction(trx);
		const [retrievedBlock] = await db.find({ id: emptyBlock.id }, ['id', 'size']);
		expect(retrievedBlock.id).toBe(emptyBlock.id);
		expect(retrievedBlock.size).toBe(50);
	});

	it('Delete and insert row', async () => {
		const connection = await getDbConnection();
		const trx = await startDbTransaction(connection);
		await db.deleteIds([emptyBlock.id], trx);
		await db.upsert([emptyBlock], trx);
		await commitDbTransaction(trx);
		const [retrievedBlock] = await db.find({ id: emptyBlock.id }, ['id']);
		expect(retrievedBlock.id).toBe(emptyBlock.id);
	});

	it('Delete, insert and increment row', async () => {
		const connection = await getDbConnection();
		const trx = await startDbTransaction(connection);
		await db.deleteIds([emptyBlock.id], trx);
		await db.upsert([emptyBlock], trx);
		await db.increment({
			increment: { timestamp: 5 },
			where: {
				property: 'id',
				value: emptyBlock.id,
			},
		}, trx);
		await commitDbTransaction(trx);
		const [retrievedBlock] = await db.find({ id: emptyBlock.id }, ['timestamp']);
		expect(retrievedBlock).toBeTruthy();
		expect(retrievedBlock.timestamp).toBe(5 + emptyBlock.timestamp);
	});
});
