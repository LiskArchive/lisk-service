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
const mysqlIndex = require('../../shared/indexdb/mysql');
const testschema = require('../../shared/schema/newsfeed');
const {
	invalidSchemaWithMissingType,
	invalidSchemaWithoutPrimaryKey,
} = require('../schemas/invalidSchemas');

const tableName = 'testSchemaNewsfeed';
const validTestSchema = 'validTestSchema';
const testSchemaWithoutPrimaryKey = 'testSchemaWithoutPrimaryKey';
const testSchemaWithoutType = 'testSchemaWithoutType';

const getIndex = () => mysqlIndex(tableName, testschema);

const { news, drupalData } = require('../constants/newsfeed');

describe('Test mysql', () => {
	let db;
	beforeAll(async () => {
		// Create table
		db = await getIndex();
	});

	afterAll(async () => {
		db.rawQuery(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
		db.rawQuery(`DROP TABLE IF EXISTS ${validTestSchema} CASCADE`);
		db.rawQuery(`DROP TABLE IF EXISTS ${testSchemaWithoutPrimaryKey} CASCADE`);
		db.rawQuery(`DROP TABLE IF EXISTS ${testSchemaWithoutType} CASCADE`);
	});

	it('Valid schema', async () => {
		const getValidIndex = () => mysqlIndex(validTestSchema, testschema);
		const testDB = await getValidIndex();
		expect(testDB).toBeInstanceOf(Object);
		expect(testDB).toEqual(
			expect.objectContaining({
				upsert: expect.any(Function),
				find: expect.any(Function),
				count: expect.any(Function),
				deleteIds: expect.any(Function),
				rawQuery: expect.any(Function),
				increment: expect.any(Function),
			}),
		);
	});

	it.todo('Update invalid schema test cases when proper error handling is implemented');

	it('Invalid schema: Missing primary key', async () => {
		const getInvalidIndex = () => mysqlIndex(
			testSchemaWithoutPrimaryKey,
			invalidSchemaWithoutPrimaryKey);
		const testDB = await getInvalidIndex();
		await testDB.upsert(news);
		expect(testDB.find()).rejects.toThrow();
	});

	it('Invalid schema: Missing type defined', async () => {
		const getInvalidIndex = () => mysqlIndex(testSchemaWithoutType, invalidSchemaWithMissingType);
		expect(getInvalidIndex()).rejects.toThrow();
	});

	it('DB exists', async () => {
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(0);
	});

	it('Upsert', async () => {
		// Valid data based on schema
		await db.upsert(news);
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(2);

		// invalid data
		expect(db.upsert(drupalData)).rejects.toThrow();
	});

	it('Find', async () => {
		const result = await db.find({ source: 'drupal_lisk_general' }, Object.keys(testschema.schema));
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);

		expect(result[0]).toMatchObject(news.filter(acc => acc.source === 'drupal_lisk_general')[0]);
	});

	it('Raw query', async () => {
		const rawQuery = 'SELECT * FROM testSchemaNewsfeed WHERE source = \'drupal_lisk_general\'';
		const result = await db.rawQuery(rawQuery);
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);

		expect(result[0]).toMatchObject(news.filter(acc => acc.source === 'drupal_lisk_general')[0]);
	});

	it('Row count', async () => {
		const count = await db.count();
		expect(count).toBe(2);
	});

	it('Increment', async () => {
		const { source } = news[0];
		await db.increment({
			increment: {
				created_at: 10,
			},
			where: {
				property: 'source',
				value: source,
			},
		}, news[0]);

		const result = await db.find({ source }, Object.keys(testschema.schema));

		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);
		expect(result[0].created_at).toEqual(news
			.filter(acc => acc.source === source)[0].created_at + 10);
	});

	it('DeleteIds', async () => {
		await db.deleteIds([news[0].source_id]);
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);
	});
});
