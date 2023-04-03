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
const { indexAppMetaInput, indexTokenMetaInput } = require('../../constants/metadataIndex');

const { LENGTH_CHAIN_ID } = require('../../../shared/constants');
const config = require('../../../config');

const applicationMetadataIndexSchema = require('../../../shared/database/schema/application_metadata');
const tokenMetadataIndexSchema = require('../../../shared/database/schema/token_metadata');
const { downloadRepositoryToFS } = require('../../../shared/utils/downloadRepository');

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

const tempDir = `${__dirname}/temp/${indexAppMetaInput.networkType}/${indexAppMetaInput.chainName}`;
const appMetaPath = `${tempDir}/${config.FILENAME.APP_JSON}`;
const tokenMetaPath = `${tempDir}/${config.FILENAME.NATIVETOKENS_JSON}`;

const tokenMetaQueryParams = {
	network: indexAppMetaInput.networkType,
	chainName: indexAppMetaInput.chainName,
	whereIn: {
		property: 'localID',
		values: indexTokenMetaInput.tokens.map(token => token.tokenID.substring(LENGTH_CHAIN_ID)),
	},
};

beforeAll(async () => {
	await mkdir(tempDir);
	await write(appMetaPath, JSON.stringify(indexAppMetaInput));
	await write(tokenMetaPath, JSON.stringify(indexTokenMetaInput));

	applicationMetadataTable = await getApplicationMetadataIndex();
	tokenMetadataTable = await getTokenMetadataIndex();
	connection = await getDbConnection(MYSQL_ENDPOINT);
});

afterAll(async () => rmdir(tempDir));

describe('Test indexAppMeta method', () => {
	afterEach(async () => {
		await applicationMetadataTable.delete({
			network: indexAppMetaInput.networkType,
			chainName: indexAppMetaInput.chainName,
		});
	});

	it('should index app meta in db when called with valid metadata object', async () => {
		await indexAppMeta(indexAppMetaInput);

		const dbResponse = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);

		expect(dbResponse[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(dbResponse.length).toEqual(1);
	});

	it('should index app meta in db only after commit when called with dbTrx', async () => {
		const dbTrx = await startDbTransaction(connection);
		await indexAppMeta(indexAppMetaInput, dbTrx);

		const responseBeforeCommit = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(responseBeforeCommit.length).toEqual(0);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
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
		await applicationMetadataTable.delete({
			network: indexAppMetaInput.networkType,
			chainName: indexAppMetaInput.chainName,
		});

		// Delete token meta info
		await tokenMetadataTable.delete(tokenMetaQueryParams);
	});

	it('should index app meta in db when called with valid app meta path', async () => {
		await indexMetadataFromFile(appMetaPath);

		const dbResponse = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);

		expect(dbResponse[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(dbResponse.length).toEqual(1);
	});

	it('should index token meta in db when called with valid token meta path', async () => {
		await indexMetadataFromFile(tokenMetaPath);

		const dbResponse = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);

		expect(dbResponse[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(dbResponse.length).toEqual(1);
	});

	it('should index app meta in db only after commit when called with valid app meta path and dbTrx', async () => {
		const dbTrx = await startDbTransaction(connection);
		await indexMetadataFromFile(appMetaPath, dbTrx);

		const responseBeforeCommit = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(responseBeforeCommit.length).toEqual(0);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
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
	beforeEach(async () => indexAppMeta(indexAppMetaInput));

	afterEach(async () => {
		await applicationMetadataTable.delete({
			network: indexAppMetaInput.networkType,
			chainName: indexAppMetaInput.chainName,
		});
	});

	it('should delete indexed app meta from db when called with valid metadata object', async () => {
		const dbResponseBefore = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(dbResponseBefore.length).toEqual(1);

		await deleteAppMeta(indexAppMetaInput);

		const dbResponse = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(dbResponse.length).toEqual(0);
	});

	it('should delete indexed app meta from db only after commit when called with dbTrx', async () => {
		const dbResponseBefore = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(dbResponseBefore.length).toEqual(1);

		const dbTrx = await startDbTransaction(connection);
		await deleteAppMeta(indexAppMetaInput, dbTrx);

		const responseBeforeCommit = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(responseBeforeCommit.length).toEqual(1);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
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
	const localIDs = indexTokenMetaInput.tokens.map(
		token => token.tokenID.substring(LENGTH_CHAIN_ID),
	);

	beforeEach(async () => indexTokensMeta({
		chainID: indexAppMetaInput.chainID,
		chainName: indexAppMetaInput.chainName,
		network: indexAppMetaInput.networkType,
		...indexTokenMetaInput,
	}));

	afterEach(async () => tokenMetadataTable.delete(tokenMetaQueryParams));

	it('should delete indexed token meta from db when called with valid token metadata object', async () => {
		const dbResponseBefore = await tokenMetadataTable.find(
			tokenMetaQueryParams,
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(dbResponseBefore.length).toEqual(1);

		await deleteTokensMeta({
			...indexTokenMetaInput,
			network: indexAppMetaInput.networkType,
			chainName: indexAppMetaInput.chainName,
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
		expect(dbResponseBefore[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(dbResponseBefore.length).toEqual(1);

		const dbTrx = await startDbTransaction(connection);
		await deleteTokensMeta(
			{
				...indexTokenMetaInput,
				network: indexAppMetaInput.networkType,
				chainName: indexAppMetaInput.chainName,
				localIDs,
			},
			dbTrx,
		);

		const responseBeforeCommit = await tokenMetadataTable.find(
			tokenMetaQueryParams,
			['chainID'],
		);
		expect(dbResponseBefore[0].chainID).toEqual(indexAppMetaInput.chainID);
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
		// Delete app meta info
		await applicationMetadataTable.delete({
			network: indexAppMetaInput.networkType,
			chainName: indexAppMetaInput.chainName,
		});

		// Delete token meta info
		await tokenMetadataTable.delete(tokenMetaQueryParams);
	});

	it('should delete indexed app meta in db when called with valid app meta path', async () => {
		const dbResponse = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(dbResponse[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(dbResponse.length).toEqual(1);

		await deleteIndexedMetadataFromFile(appMetaPath);

		const dbResponseAfterDelete = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(dbResponseAfterDelete.length).toEqual(0);
	});

	it('should delete indexed token meta in db when called with valid token meta path', async () => {
		const dbResponse = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(dbResponse[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(dbResponse.length).toEqual(1);

		await deleteIndexedMetadataFromFile(tokenMetaPath);

		const dbResponseAfterDelete = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(dbResponseAfterDelete.length).toEqual(0);
	});

	it('should delete indexed app meta in db only after commit when called with valid app meta path and dbTrx', async () => {
		const responseBefore = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(responseBefore[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(responseBefore.length).toEqual(1);

		const dbTrx = await startDbTransaction(connection);
		await deleteIndexedMetadataFromFile(appMetaPath, dbTrx);

		const responseBeforeCommit = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(responseBeforeCommit[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(responseBeforeCommit.length).toEqual(1);

		await commitDbTransaction(dbTrx);

		const responseAfterCommit = await applicationMetadataTable.find(
			{ network: indexAppMetaInput.networkType, chainName: indexAppMetaInput.chainName },
			['chainID'],
		);
		expect(responseAfterCommit.length).toEqual(0);
	});

	it('should delete indexed token meta in db only after commit when called with valid token meta path and dbTrx', async () => {
		const responseBefore = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(responseBefore[0].chainID).toEqual(indexAppMetaInput.chainID);
		expect(responseBefore.length).toEqual(1);

		const dbTrx = await startDbTransaction(connection);
		await deleteIndexedMetadataFromFile(tokenMetaPath, dbTrx);

		const responseBeforeCommit = await tokenMetadataTable.find(tokenMetaQueryParams, ['chainID']);
		expect(responseBeforeCommit[0].chainID).toEqual(indexAppMetaInput.chainID);
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
