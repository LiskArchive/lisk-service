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
const {
	appMetaObj: mockAppMetaObj,
	tokenMetaObj: mockTokenMetaObj,
} = require('../../constants/metadataIndex');

const tempDir = `${__dirname}/temp/${mockAppMetaObj.networkType}/${mockAppMetaObj.chainName}`;
const mockAppMetaPath = `${tempDir}/${require('../../../config').FILENAME.APP_JSON}`;
const mockTokenMetaPath = `${tempDir}/${require('../../../config').FILENAME.NATIVETOKENS_JSON}`;

beforeEach(() => jest.resetModules());

describe('Test indexTokensMeta method', () => {
	it('should index token meta in db when called with valid metadata object', async () => {
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheRedis: jest.fn(),
				CacheLRU: jest.fn(),
				MySQL: {
					getTableInstance: () => ({
						upsert: (dataArray) => expect(dataArray[0].tokenID)
							.toEqual(mockTokenMetaObj.tokens[0].tokenID),
					}),
					getDbConnection: jest.fn(),
					startDbTransaction: jest.fn(),
					commitDbTransaction: jest.fn(),
					rollbackDbTransaction: jest.fn(),
				},
			};
		});
		const { indexTokensMeta } = require('../../../shared/metadataIndex');
		await indexTokensMeta(mockTokenMetaObj);
	});

	it('should throw error when called with null or undefined tokenMeta', async () => {
		const { indexTokensMeta } = require('../../../shared/metadataIndex');
		expect(() => indexTokensMeta(null)).rejects.toThrow();
		expect(() => indexTokensMeta(undefined)).rejects.toThrow();
	});
});

describe('Test indexAppMeta method', () => {
	it('should index app meta in db when called with valid metadata object', async () => {
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheRedis: jest.fn(),
				CacheLRU: jest.fn(),
				MySQL: {
					getTableInstance: () => ({
						upsert: (data) => expect(data.chainID).toEqual(mockAppMetaObj.chainID),
					}),
					getDbConnection: jest.fn(),
					startDbTransaction: jest.fn(),
					commitDbTransaction: jest.fn(),
					rollbackDbTransaction: jest.fn(),
				},
			};
		});
		const { indexAppMeta } = require('../../../shared/metadataIndex');
		await indexAppMeta(mockAppMetaObj);
	});

	it('should throw error when called with null or undefined appMeta', async () => {
		const { indexAppMeta } = require('../../../shared/metadataIndex');
		expect(() => indexAppMeta(null)).rejects.toThrow();
		expect(() => indexAppMeta(undefined)).rejects.toThrow();
	});
});

describe('Test indexMetadataFromFile method', () => {
	it('should index app meta in db when called with valid app meta path', async () => {
		jest.mock('../../../shared/utils/fs', () => {
			const actual = jest.requireActual('../../../shared/utils/fs');
			return {
				...actual,
				read: (filePath) => {
					expect(filePath).toEqual(mockAppMetaPath);
					return JSON.stringify(mockAppMetaObj);
				},
				exists: () => true,
			};
		});
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				MySQL: {
					getTableInstance: () => ({
						upsert: (data) => expect(data.chainID).toEqual(mockAppMetaObj.chainID),
					}),
					getDbConnection: jest.fn(),
					startDbTransaction: jest.fn(),
					commitDbTransaction: jest.fn(),
					rollbackDbTransaction: jest.fn(),
				},
			};
		});

		const { indexMetadataFromFile } = require('../../../shared/metadataIndex');
		await indexMetadataFromFile(mockAppMetaPath);
	});

	it('should index token meta in db when called with valid token meta path', async () => {
		jest.mock('../../../shared/utils/fs', () => {
			const actual = jest.requireActual('../../../shared/utils/fs');
			return {
				...actual,
				read: (filePath) => {
					if (filePath === mockAppMetaPath) return JSON.stringify(mockAppMetaObj);
					if (filePath === mockTokenMetaPath) return JSON.stringify(mockTokenMetaObj);

					throw new Error(`Invalid file path passed to fs.read. filePath:${filePath}`);
				},
				exists: () => true,
			};
		});
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				MySQL: {
					getTableInstance: () => ({
						upsert: (data) => expect(data[0].tokenID).toEqual(mockTokenMetaObj.tokens[0].tokenID),
					}),
					getDbConnection: jest.fn(),
					startDbTransaction: jest.fn(),
					commitDbTransaction: jest.fn(),
					rollbackDbTransaction: jest.fn(),
				},
			};
		});

		const { indexMetadataFromFile } = require('../../../shared/metadataIndex');
		await indexMetadataFromFile(mockTokenMetaPath);
	});

	it('should throw error when called with null or undefined filePath', async () => {
		const { indexMetadataFromFile } = require('../../../shared/metadataIndex');
		expect(() => indexMetadataFromFile(null)).rejects.toThrow();
		expect(() => indexMetadataFromFile(undefined)).rejects.toThrow();
	});
});

describe('Test deleteAppMeta method', () => {
	it('should delete app meta in db when called with valid metadata object', async () => {
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheRedis: jest.fn(),
				CacheLRU: jest.fn(),
				MySQL: {
					getTableInstance: () => ({
						delete: (data) => expect(data).toEqual({
							network: mockAppMetaObj.networkType,
							chainName: mockAppMetaObj.chainName,
						}),
					}),
				},
			};
		});
		const { deleteAppMeta } = require('../../../shared/metadataIndex');
		await deleteAppMeta(mockAppMetaObj);
	});

	it('should throw error when called with null or undefined appMeta', async () => {
		const { deleteAppMeta } = require('../../../shared/metadataIndex');
		expect(() => deleteAppMeta(null)).rejects.toThrow();
		expect(() => deleteAppMeta(undefined)).rejects.toThrow();
	});
});

describe('Test deleteTokensMeta method', () => {
	it('should delete token meta in db when called with valid metadata object', async () => {
		const tokenIDs = mockTokenMetaObj.tokens.map(token => token.tokenID);
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheRedis: jest.fn(),
				CacheLRU: jest.fn(),
				MySQL: {
					getTableInstance: () => ({
						delete: (data) => expect(data.tokenID).toEqual(mockTokenMetaObj.tokens[0].tokenID),
					}),
					getDbConnection: jest.fn(),
					startDbTransaction: jest.fn(),
					commitDbTransaction: jest.fn(),
					rollbackDbTransaction: jest.fn(),
				},
			};
		});
		const { deleteTokensMeta } = require('../../../shared/metadataIndex');
		await deleteTokensMeta({ tokenIDs });
	});

	it('should throw error when called with null or undefined tokenMeta', async () => {
		const { deleteTokensMeta } = require('../../../shared/metadataIndex');
		expect(() => deleteTokensMeta(null)).rejects.toThrow();
		expect(() => deleteTokensMeta(undefined)).rejects.toThrow();
	});
});

describe('Test deleteIndexedMetadataFromFile method', () => {
	it('should delete app meta in db when called with valid app meta path', async () => {
		jest.mock('../../../shared/utils/fs', () => {
			const actual = jest.requireActual('../../../shared/utils/fs');
			return {
				...actual,
				read: (filePath) => {
					expect(filePath).toEqual(mockAppMetaPath);
					return JSON.stringify(mockAppMetaObj);
				},
				exists: () => true,
			};
		});
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				MySQL: {
					getTableInstance: () => ({
						delete: (data) => expect(data).toEqual({
							network: mockAppMetaObj.networkType,
							chainName: mockAppMetaObj.chainName,
						}),
					}),
					getDbConnection: jest.fn(),
					startDbTransaction: jest.fn(),
					commitDbTransaction: jest.fn(),
					rollbackDbTransaction: jest.fn(),
				},
			};
		});

		const { deleteIndexedMetadataFromFile } = require('../../../shared/metadataIndex');
		await deleteIndexedMetadataFromFile(mockAppMetaPath);
	});

	it('should delete token meta in db when called with valid token meta path', async () => {
		jest.mock('../../../shared/utils/fs', () => {
			const actual = jest.requireActual('../../../shared/utils/fs');
			return {
				...actual,
				read: (filePath) => {
					if (filePath === mockAppMetaPath) return JSON.stringify(mockAppMetaObj);
					if (filePath === mockTokenMetaPath) return JSON.stringify(mockTokenMetaObj);

					throw new Error(`Invalid file path passed to fs.read. filePath:${filePath}`);
				},
				exists: () => true,
			};
		});
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				MySQL: {
					getTableInstance: () => ({
						delete: (data) => expect(data.tokenID).toEqual(mockTokenMetaObj.tokens[0].tokenID),
					}),
					getDbConnection: jest.fn(),
					startDbTransaction: jest.fn(),
					commitDbTransaction: jest.fn(),
					rollbackDbTransaction: jest.fn(),
				},
			};
		});

		const { deleteIndexedMetadataFromFile } = require('../../../shared/metadataIndex');
		await deleteIndexedMetadataFromFile(mockTokenMetaPath);
	});

	it('should throw error when called with null or undefined filePath', async () => {
		const { deleteIndexedMetadataFromFile } = require('../../../shared/metadataIndex');
		expect(() => deleteIndexedMetadataFromFile(null)).rejects.toThrow();
		expect(() => deleteIndexedMetadataFromFile(undefined)).rejects.toThrow();
	});
});

describe('Test indexAllBlockchainAppsMeta method', () => {
	it('should index token meta in db when called with valid metadata object', async () => {
		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				CacheRedis: jest.fn(),
				CacheLRU: jest.fn(),
				MySQL: {
					getTableInstance: () => ({
						upsert: (dataArray) => expect(dataArray[0].tokenID)
							.toEqual(mockTokenMetaObj.tokens[0].tokenID),
					}),
					getDbConnection: jest.fn(),
					startDbTransaction: jest.fn(),
					commitDbTransaction: jest.fn(),
					rollbackDbTransaction: jest.fn(),
				},
			};
		});

		jest.mock('../../../config', () => {
			const actual = jest.requireActual('../../../config');
			return {
				...actual,
				supportedNetworks: ['betanet'],
			};
		});

		jest.mock('../../../shared/utils/fs', () => {
			const actual = jest.requireActual('../../../shared/utils/fs');
			return {
				...actual,
				getDirectories: () => ['Lisk'],
				getFiles: () => [
					mockAppMetaPath,
					mockTokenMetaPath,
				],
				read: (filePath) => {
					if (filePath === mockAppMetaPath) return JSON.stringify(mockAppMetaObj);
					if (filePath === mockTokenMetaPath) return JSON.stringify(mockTokenMetaObj);

					throw new Error(`Invalid file path passed to fs.read. filePath:${filePath}`);
				},
				exists: () => true,
			};
		});

		jest.mock('lisk-service-framework', () => {
			const actual = jest.requireActual('lisk-service-framework');
			return {
				...actual,
				MySQL: {
					getTableInstance: () => ({
						delete: (data) => {
							if (data.chainID) {
								expect(data.chainID).toEqual(mockAppMetaObj.chainID);
							} else {
								expect(data[0].tokenID).toEqual(mockTokenMetaObj.tokens[0].tokenID);
							}
						},
					}),
					getDbConnection: jest.fn(),
					startDbTransaction: jest.fn(),
					commitDbTransaction: jest.fn(),
					rollbackDbTransaction: jest.fn(),
				},
			};
		});

		const { indexAllBlockchainAppsMeta } = require('../../../shared/metadataIndex');
		await indexAllBlockchainAppsMeta(mockTokenMetaObj);
	});
});
