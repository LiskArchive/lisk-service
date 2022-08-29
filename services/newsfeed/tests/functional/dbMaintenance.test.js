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
const moment = require('moment');

const { MySQL: { getTableInstance } } = require('lisk-service-framework');

const schema = require('../../shared/schema/newsfeed');

const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const tableName = 'newsfeedTestSchema';
const getIndex = () => getTableInstance(tableName, schema, MYSQL_ENDPOINT);

const { normalizedTwitterData } = require('../constants/newsfeed');
const { prune } = require('../../shared/dbMaintenance');

describe('Test DB Maintenance', () => {
	let db;
	beforeAll(async () => {
		// Create table & insert raw data
		db = await getIndex();
		await db.upsert(normalizedTwitterData);
	});

	afterAll(async () => {
		const result = await db.find();
		await db.deleteByPrimaryKey(result.map(r => r[`${schema.primaryKey}`]));
		db.rawQuery(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
	});

	it('Purge works', async () => {
		const expiryInDays = 30;

		const source = 'twitter_lisk';
		const propBetweens = [{
			property: 'modified_at',
			to: moment().subtract(expiryInDays, 'days').unix(),
		}];

		const orgEntries = await db.find({ source, propBetweens });
		expect(orgEntries.length).toBeGreaterThan(0);
		expect(orgEntries.length).toBe(normalizedTwitterData.length);

		// Test the Pruning logic
		await prune(source, 'newsfeedTestSchema', expiryInDays);

		const postPruneEntries = await db.find({ source, propBetweens });
		expect(postPruneEntries.length).toBe(0);
	});
});
