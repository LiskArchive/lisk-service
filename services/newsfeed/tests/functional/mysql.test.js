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
const schema = require('../../shared/schema/newsfeed');

const getIndex = () => mysqlIndex('testSchema', schema);

const { newsfeeds } = require('../constants/newsfeed');

describe('Test mysql', () => {
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
		await db.upsert(newsfeeds);
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);
	});

	it('Fetch rows', async () => {
		const result = await db.find({ source: 'drupal_lisk_general' });
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);
	});

	it('Row count', async () => {
		const count = await db.count();
		expect(count).toBe(1);
	});
});
