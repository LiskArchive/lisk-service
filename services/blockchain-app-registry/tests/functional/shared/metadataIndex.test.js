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
/* eslint-disable mocha/max-top-level-suites */
jest.setTimeout(15000);

const {
	MySQL: {
		getTableInstance,
		getDbConnection,
		startDbTransaction,
		commitDbTransaction,
	},
} = require('lisk-service-framework');

const { mkdir, rmdir, write } = require('../../../shared/utils/fsUtils');
const {
	indexAppMeta,
	indexMetadataFromFile,
	deleteAppMeta,
	indexTokensMeta,
	deleteTokensMeta,
	deleteIndexedMetadataFromFile,
	indexAllBlockchainAppsMeta,
} = require('../../../shared/metadataIndex');
const { downloadRepositoryToFS } = require('../../../shared/utils/downloadRepository');

const {
	appMetaObj,
	tokenMetaObj,
} = require('../../constants/metadataIndex');

const { LENGTH_CHAIN_ID } = require('../../../shared/constants');
const config = require('../../../config');

const applicationMetadataIndexSchema = require('../../../shared/database/schema/application_metadata');
const tokenMetadataIndexSchema = require('../../../shared/database/schema/token_metadata');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getApplicationMetadataIndex = () => getTableInstance(
	applicationMetadataIndexSchema.tableName,
	applicationMetadataIndexSchema,
	MYSQL_ENDPOINT,
);
const getTokenMetadataIndex = () => getTableInstance(
	tokenMetadataIndexSchema.tableName,
	tokenMetadataIndexSchema,
	MYSQL_ENDPOINT,
);

let applicationMetadataTable;
let tokenMetadataTable;
let connection;

const tempDir = `${__dirname}/temp/${appMetaObj.networkType}/${appMetaObj.chainName}`;
const appMetaPath = `${tempDir}/${config.FILENAME.APP_JSON}`;
const tokenMetaPath = `${tempDir}/${config.FILENAME.NATIVETOKENS_JSON}`;

const appMetaQueryParams = {
	network: appMetaObj.networkType,
	chainName: appMetaObj.chainName,
};
const tokenMetaQueryParams = {
	...appMetaQueryParams,
	whereIn: {
		property: 'localID',
		values: tokenMetaObj.tokens.map(token => token.tokenID.substring(LENGTH_CHAIN_ID)),
	},
};

beforeAll(async () => {
	// Create metadata files in a temporary directory
	await mkdir(tempDir);
	await write(appMetaPath, JSON.stringify(appMetaObj));
	await write(tokenMetaPath, JSON.stringify(tokenMetaObj));

	applicationMetadataTable = await getApplicationMetadataIndex();
	tokenMetadataTable = await getTokenMetadataIndex();
	connection = await getDbConnection(MYSQL_ENDPOINT);
});

afterAll(async () => rmdir(tempDir));

describe('Test indexAppMeta method', () => {
	afterEach(async () => applicationMetadataTable.delete(appMetaQueryParams));

	it('should index app meta in db when called with valid metadata object', async () => {
		await indexAppMeta(appMetaObj);

		const dbResponse = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);

		expect(dbResponse[0].chainID).toEqual(appMetaObj.chainID);
		expect(dbResponse.length).toEqual(1);
	});

	it('should index app meta in db only after commit when called with dbTrx', async () => {
		const dbTrx = await startDbTransaction(connection);
		await indexAppMeta(appMetaObj, dbTrx);

		const responseBeforeCommit = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(responseBeforeCommit.length).toEqual(0);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(responseAfterCommit.length).toEqual(1);
	});

	it('should throw error when called with null or undefined appMeta', async () => {
		expect(() => indexAppMeta(null)).rejects.toThrow();
		expect(() => indexAppMeta(undefined)).rejects.toThrow();
	});
});

describe('Test indexMetadataFromFile method', () => {
	afterEach(async () => {
		// Delete app meta info
		await applicationMetadataTable.delete(appMetaQueryParams);

		// Delete token meta info
		await tokenMetadataTable.delete(tokenMetaQueryParams);
	});

	it('should index app meta in db when called with valid app meta path', async () => {
		await indexMetadataFromFile(appMetaPath);

		const dbResponse = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);

		expect(dbResponse[0].chainID).toEqual(appMetaObj.chainID);
		expect(dbResponse.length).toEqual(1);
	});

	it('should index token meta in db when called with valid token meta path', async () => {
		await indexMetadataFromFile(tokenMetaPath);

		const dbResponse = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);

		expect(dbResponse[0].chainID).toEqual(appMetaObj.chainID);
		expect(dbResponse.length).toEqual(1);
	});

	it('should index app meta in db only after commit when called with valid app meta path and dbTrx', async () => {
		const dbTrx = await startDbTransaction(connection);
		await indexMetadataFromFile(appMetaPath, dbTrx);

		const responseBeforeCommit = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(responseBeforeCommit.length).toEqual(0);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(responseAfterCommit.length).toEqual(1);
	});

	it('should index token meta in db only after commit when called with valid token meta path and dbTrx', async () => {
		const dbTrx = await startDbTransaction(connection);
		await indexMetadataFromFile(tokenMetaPath, dbTrx);

		const responseBeforeCommit = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(responseBeforeCommit.length).toEqual(0);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(responseAfterCommit.length).toEqual(1);
	});

	it('should throw error when called with null or undefined filePath', async () => {
		expect(() => indexMetadataFromFile(null)).rejects.toThrow();
		expect(() => indexMetadataFromFile(undefined)).rejects.toThrow();
	});
});

describe('Test deleteAppMeta method', () => {
	beforeEach(async () => indexAppMeta(appMetaObj));

	afterEach(async () => applicationMetadataTable.delete(appMetaQueryParams));

	it('should delete indexed app meta from db when called with valid metadata object', async () => {
		const dbResponseBefore = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(appMetaObj.chainID);
		expect(dbResponseBefore.length).toEqual(1);

		await deleteAppMeta(appMetaObj);

		const dbResponse = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(dbResponse.length).toEqual(0);
	});

	it('should delete indexed app meta from db only after commit when called with dbTrx', async () => {
		const dbResponseBefore = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(appMetaObj.chainID);
		expect(dbResponseBefore.length).toEqual(1);

		const dbTrx = await startDbTransaction(connection);
		await deleteAppMeta(appMetaObj, dbTrx);

		const responseBeforeCommit = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(appMetaObj.chainID);
		expect(responseBeforeCommit.length).toEqual(1);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(responseAfterCommit.length).toEqual(0);
	});

	it('should throw error when called with null or undefined appMeta', async () => {
		expect(() => deleteAppMeta(null)).rejects.toThrow();
		expect(() => deleteAppMeta(undefined)).rejects.toThrow();
	});
});

describe('Test deleteTokenMeta method', () => {
	const localIDs = tokenMetaObj.tokens.map(
		token => token.tokenID.substring(LENGTH_CHAIN_ID),
	);

	beforeEach(async () => indexTokensMeta({
		chainID: appMetaObj.chainID,
		chainName: appMetaObj.chainName,
		network: appMetaObj.networkType,
		...tokenMetaObj,
	}));

	afterEach(async () => tokenMetadataTable.delete(tokenMetaQueryParams));

	it('should delete indexed token meta from db when called with valid token metadata object', async () => {
		const dbResponseBefore = await tokenMetadataTable.find(
			tokenMetaQueryParams,
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(appMetaObj.chainID);
		expect(dbResponseBefore.length).toEqual(1);

		await deleteTokensMeta({
			...tokenMetaObj,
			network: appMetaObj.networkType,
			chainName: appMetaObj.chainName,
			localIDs,
		});

		const dbResponse = await tokenMetadataTable.find(
			tokenMetaQueryParams,
			['chainID'],
		);
		expect(dbResponse.length).toEqual(0);
	});

	it('should delete indexed token meta from db only after commit when called with dbTrx', async () => {
		const dbResponseBefore = await tokenMetadataTable.find(
			tokenMetaQueryParams,
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(appMetaObj.chainID);
		expect(dbResponseBefore.length).toEqual(1);

		const dbTrx = await startDbTransaction(connection);
		await deleteTokensMeta(
			{
				...tokenMetaObj,
				network: appMetaObj.networkType,
				chainName: appMetaObj.chainName,
				localIDs,
			},
			dbTrx,
		);

		const responseBeforeCommit = await tokenMetadataTable.find(
			tokenMetaQueryParams,
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(appMetaObj.chainID);
		expect(responseBeforeCommit.length).toEqual(1);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await tokenMetadataTable.find(
			tokenMetaQueryParams,
			['chainID'],
		);
		expect(responseAfterCommit.length).toEqual(0);
	});

	it('should throw error when called with null or undefined tokenMeta', async () => {
		expect(() => deleteTokensMeta(null)).rejects.toThrow();
		expect(() => deleteTokensMeta(undefined)).rejects.toThrow();
	});
});

describe('Test deleteIndexedMetadataFromFile method', () => {
	beforeEach(async () => {
		await indexMetadataFromFile(appMetaPath);
		await indexMetadataFromFile(tokenMetaPath);
	});

	afterEach(async () => {
		// Delete app and token meta info
		await applicationMetadataTable.delete(appMetaQueryParams);
		await tokenMetadataTable.delete(tokenMetaQueryParams);
	});

	it('should delete indexed app meta in db when called with valid app meta path', async () => {
		const dbResponse = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(dbResponse[0].chainID).toEqual(appMetaObj.chainID);
		expect(dbResponse.length).toEqual(1);

		await deleteIndexedMetadataFromFile(appMetaPath);

		const dbResponseAfterDelete = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(dbResponseAfterDelete.length).toEqual(0);
	});

	it('should delete indexed token meta in db when called with valid token meta path', async () => {
		const dbResponse = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(dbResponse[0].chainID).toEqual(appMetaObj.chainID);
		expect(dbResponse.length).toEqual(1);

		await deleteIndexedMetadataFromFile(tokenMetaPath);

		const dbResponseAfterDelete = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(dbResponseAfterDelete.length).toEqual(0);
	});

	it('should delete indexed app meta in db only after commit when called with valid app meta path and dbTrx', async () => {
		const responseBefore = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(responseBefore[0].chainID).toEqual(appMetaObj.chainID);
		expect(responseBefore.length).toEqual(1);

		const dbTrx = await startDbTransaction(connection);
		await deleteIndexedMetadataFromFile(appMetaPath, dbTrx);

		const responseBeforeCommit = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(responseBeforeCommit[0].chainID).toEqual(appMetaObj.chainID);
		expect(responseBeforeCommit.length).toEqual(1);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await applicationMetadataTable.find(
			appMetaQueryParams,
			['chainID'],
		);
		expect(responseAfterCommit.length).toEqual(0);
	});

	it('should delete indexed token meta in db only after commit when called with valid token meta path and dbTrx', async () => {
		const responseBefore = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(responseBefore[0].chainID).toEqual(appMetaObj.chainID);
		expect(responseBefore.length).toEqual(1);

		const dbTrx = await startDbTransaction(connection);
		await deleteIndexedMetadataFromFile(tokenMetaPath, dbTrx);

		const responseBeforeCommit = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(responseBeforeCommit[0].chainID).toEqual(appMetaObj.chainID);
		expect(responseBeforeCommit.length).toEqual(1);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(responseAfterCommit.length).toEqual(0);
	});

	it('should throw error when called with null or undefined filePath', async () => {
		expect(() => deleteIndexedMetadataFromFile(null)).rejects.toThrow();
		expect(() => deleteIndexedMetadataFromFile(undefined)).rejects.toThrow();
	});
});

describe('Test indexAllBlockchainAppsMeta method', () => {
	beforeEach(async () => {
		await rmdir(config.dataDir);
		await applicationMetadataTable.delete({});
		await tokenMetadataTable.delete({});
	});

	it('should throw error when data is not present', async () => {
		expect(() => indexAllBlockchainAppsMeta()).rejects.toThrow();
	});

	xit('should index app and token meta in db when data is present', async () => {
		await downloadRepositoryToFS();

		await indexAllBlockchainAppsMeta();
		const appMetaCount = await applicationMetadataTable.count();
		const tokenMetaCount = await tokenMetadataTable.count();

		expect(appMetaCount).toBeGreatherThanOrEqual(1);
		expect(tokenMetaCount).toBeGreatherThanOrEqual(1);
	});
});
