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
		getDBConnection,
		startDBTransaction,
		commitDBTransaction,
		rollbackDBTransaction,
} = require('../../src/mysql');

const { getKeyValueTable } = require('../../src/mysqlKVStore');

const CONN_ENDPOINT_DEFAULT = 'mysql://lisk:password@localhost:3306/lisk';

const MYSQL_ENDPOINT = CONN_ENDPOINT_DEFAULT;

const KEY_1 = 'KEY_1';
const KEY_2 = 'KEY_2';
const VALUE_1 = 'VALUE_1';
const VALUE_2 = 'VALUE_2';

let dbConnection;
let keyValueTable;

beforeAll(async () => {
	dbConnection = await getDBConnection(MYSQL_ENDPOINT);
	keyValueTable = await getKeyValueTable(CONN_ENDPOINT_DEFAULT);
});

afterEach(async () => {
	await keyValueTable.delete(KEY_1);
	await keyValueTable.delete(KEY_2);
});

describe('Test set and get methods', () => {
	it('should set and update value correctly', async () => {
		// Set and check key
		await keyValueTable.set(KEY_1, VALUE_1);
		const response = await keyValueTable.get(KEY_1);
		expect(response).toBe(VALUE_1);

		// Update and check key
		await keyValueTable.set(KEY_1, VALUE_2);
		const response2 = await keyValueTable.get(KEY_1);
		expect(response2).toBe(VALUE_2);
	});

	it('should set value once transaction is committed', async () => {
		// Check key is not defined
		const responseBefore = await keyValueTable.get(KEY_1);
		expect(responseBefore).toBe(undefined);

		// Create transaction and set key
		const dbTrx = await startDBTransaction(dbConnection);
		await keyValueTable.set(KEY_1, VALUE_1, dbTrx);
		const responseBeforeCommit = await keyValueTable.get(KEY_1);
		expect(responseBeforeCommit).toBe(undefined);

		// Commit transaction and check key
		await commitDBTransaction(dbTrx);
		const responseAfterCommit = await keyValueTable.get(KEY_1);
		expect(responseAfterCommit).toBe(VALUE_1);
	});

	it('should not set value once transaction is rolled-back', async () => {
		// Check key is not defined
		const responseBefore = await keyValueTable.get(KEY_1);
		expect(responseBefore).toBe(undefined);

		// Create transaction and set key
		const dbTrx = await startDBTransaction(dbConnection);
		await keyValueTable.set(KEY_1, VALUE_1, dbTrx);
		const responseBeforeRollback = await keyValueTable.get(KEY_1);
		expect(responseBeforeRollback).toBe(undefined);

		// Commit transaction and check key
		await rollbackDBTransaction(dbTrx);
		const responseAfterRollback = await keyValueTable.get(KEY_1);
		expect(responseAfterRollback).toBe(undefined);
	});

	it('should get value before transaction is committed if transaction param is passed', async () => {
		// Check key is not defined
		const responseBefore = await keyValueTable.get(KEY_1);
		expect(responseBefore).toBe(undefined);

		// Create transaction and set key
		const dbTrx = await startDBTransaction(dbConnection);
		await keyValueTable.set(KEY_1, VALUE_1, dbTrx);
		const responseBeforeRollback = await keyValueTable.get(KEY_1);
		expect(responseBeforeRollback).toBe(undefined);

		// Check value before committing transaction
		const responseBeforeCommit = await keyValueTable.get(KEY_1, dbTrx);
		expect(responseBeforeCommit).toBe(VALUE_1);

		// Commit transaction and check key
		await commitDBTransaction(dbTrx);
		const responseAfterCommit = await keyValueTable.get(KEY_1);
		expect(responseAfterCommit).toBe(VALUE_1);
	});

	it('should get value before transaction is committed if transaction param is not passed', async () => {
		// Check key is not defined
		const responseBefore = await keyValueTable.get(KEY_1);
		expect(responseBefore).toBe(undefined);

		// Create transaction and set key
		const dbTrx = await startDBTransaction(dbConnection);
		await keyValueTable.set(KEY_1, VALUE_1, dbTrx);
		const responseBeforeRollback = await keyValueTable.get(KEY_1);
		expect(responseBeforeRollback).toBe(undefined);

		// Check value before committing transaction
		const responseBeforeCommit = await keyValueTable.get(KEY_1);
		expect(responseBeforeCommit).toBe(undefined);

		// Commit transaction and check key
		await commitDBTransaction(dbTrx);
		const responseAfterCommit = await keyValueTable.get(KEY_1);
		expect(responseAfterCommit).toBe(VALUE_1);
	});
});

describe('Test getByPattern method', () => {
	beforeEach(async () => {
		await keyValueTable.set(KEY_1, VALUE_1);
		await keyValueTable.set(KEY_2, VALUE_2);
	});

	it('should return correct response for partial match of same case pattern', async () => {
		// Set and check key
		const response = await keyValueTable.getByPattern('KEY');
		expect(response).toEqual([
			{
				key: KEY_1,
				value: VALUE_1,
			},
			{
				key: KEY_2,
				value: VALUE_2,
			},
		]);
	});

	it('should return correct response for partial match of case insensitive pattern', async () => {
		const response = await keyValueTable.getByPattern('kEy');
		expect(response).toEqual([
			{
				key: KEY_1,
				value: VALUE_1,
			},
			{
				key: KEY_2,
				value: VALUE_2,
			},
		]);
	});

	it('should return correct response for partial match of second key', async () => {
		const response = await keyValueTable.getByPattern('2');
		expect(response).toEqual([
			{
				key: KEY_2,
				value: VALUE_2,
			},
		]);
	});
});

describe('Test delete method', () => {
	it('should return undefined after deleting key', async () => {
		await keyValueTable.set(KEY_1, VALUE_1);
		const responseBefore = await keyValueTable.get(KEY_1);
		expect(responseBefore).toEqual(VALUE_1);

		await keyValueTable.delete(KEY_1);
		const responseAfter = await keyValueTable.get(KEY_1);
		expect(responseAfter).toEqual(undefined);
	});

	it('should return undefined after deleting non-existing key', async () => {
		const responseBefore = await keyValueTable.get(KEY_1);
		expect(responseBefore).toEqual(undefined);

		await keyValueTable.delete(KEY_1);
		const responseAfter = await keyValueTable.get(KEY_1);
		expect(responseAfter).toEqual(undefined);
	});

	it('should delete key only when transaction is committed', async () => {
		// Set key
		await keyValueTable.set(KEY_1, VALUE_1);
		const responseBefore = await keyValueTable.get(KEY_1);
		expect(responseBefore).toEqual(VALUE_1);

		// Create transaction and delete key
		const dbTrx = await startDBTransaction(dbConnection);
		await keyValueTable.delete(KEY_1, dbTrx);
		const responseBeforeCommit = await keyValueTable.get(KEY_1);
		expect(responseBeforeCommit).toEqual(VALUE_1);

		// Commit transaction
		await commitDBTransaction(dbTrx);
		const responseAfterCommit = await keyValueTable.get(KEY_1);
		expect(responseAfterCommit).toEqual(undefined);
	});

	it('should not delete key only when transaction is rolled-back', async () => {
		// Set key
		await keyValueTable.set(KEY_1, VALUE_1);
		const responseBefore = await keyValueTable.get(KEY_1);
		expect(responseBefore).toEqual(VALUE_1);

		// Create transaction and delete key
		const dbTrx = await startDBTransaction(dbConnection);
		await keyValueTable.delete(KEY_1, dbTrx);
		const responseBeforeRollback = await keyValueTable.get(KEY_1);
		expect(responseBeforeRollback).toEqual(VALUE_1);

		// Rollback transaction
		await rollbackDBTransaction(dbTrx);
		const responseAfterRollback = await keyValueTable.get(KEY_1);
		expect(responseAfterRollback).toEqual(VALUE_1);
	});
});
