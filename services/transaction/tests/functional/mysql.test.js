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
const schema = require('../../shared/schema/multisignature');

const tableName = 'testSchemaTransaction';
const getIndex = () => mysqlIndex(tableName, schema);

const { transaction } = require('../constants/multisignature');

describe('Test mysql', () => {
	let db;
	beforeAll(async () => {
		// Create table
		db = await getIndex();
	});

	afterAll(async () => db.rawQuery(`DROP TABLE IF EXISTS ${tableName} CASCADE`));

	it('DB exists', async () => {
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(0);
	});

	it('Insert row', async () => {
		await db.upsert(transaction);
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(2);
	});

	it('Fetch rows', async () => {
		const result = await db.find({ serviceId: '22139cb8-d1d3-43ec-b7d3-9f1ed30e5957' });
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);

		expect(result[0]).toMatchObject(transaction.filter(tx => tx.serviceId === '22139cb8-d1d3-43ec-b7d3-9f1ed30e5957')[0]);
	});

	it('Raw query', async () => {
		const { serviceId } = transaction[0];
		const rawQuery = `SELECT * FROM testSchemaTransaction WHERE serviceId = '${serviceId}'`;
		const result = await db.rawQuery(rawQuery);
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);

		expect(result[0]).toMatchObject(transaction.filter(tx => tx.serviceId === '22139cb8-d1d3-43ec-b7d3-9f1ed30e5957')[0]);
	});

	it('Row count', async () => {
		const count = await db.count();
		expect(count).toBe(2);
	});

	it('Increment', async () => {
		const { senderPublicKey } = transaction[0];
		await db.increment({
			increment: {
				nonce: 5,
			},
			where: {
				property: 'senderPublicKey',
				value: senderPublicKey,
			},
		}, transaction[0]);

		const result = await db.find({ senderPublicKey });

		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);
		expect(result[0].nonce).toEqual(transaction
			.filter(tx => tx.senderPublicKey === senderPublicKey)[0].nonce + 5);
	});

	it('Delete row', async () => {
		await db.deleteIds(['22139cb8-d1d3-43ec-b7d3-9f1ed30e5957']);
		const result = await db.find();
		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(1);
	});
});
