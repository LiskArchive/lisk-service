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
const { getRepoInfoFromURL, getUniqueNetworkAppDirPairs, filterMetaConfigFilesByNetwork, getModifiedFileNames } = require('../../../../shared/utils/downloadRepository');
const config = require('../../../../config');
const {
	getModifiedFileNamesInput,
	getModifiedFileNamesExpectedResponse,
} = require('../../../constants/downloadRepository');

// Mock KeyValueStore table
jest.mock('lisk-service-framework', () => {
	const actualLiskServiceFramework = jest.requireActual('lisk-service-framework');
	return {
		...actualLiskServiceFramework,
		MySQL: {
			...actualLiskServiceFramework.MySQL,
			KVStore: {
				...actualLiskServiceFramework.KVStore,
				getKeyValueTable: jest.fn(),
			},
		},
	};
});

describe('Test getRepoInfoFromURL method', () => {
	it('should return proper response when url is valid', async () => {
		const response = getRepoInfoFromURL(config.gitHub.appRegistryRepo);
		expect(response).toMatchObject({
			owner: 'LiskHQ',
			repo: 'app-registry',
		});
	});

	it('should return proper response when url does not have owner or repo', async () => {
		const response = getRepoInfoFromURL('http://example.com');
		expect(response).toMatchObject({
			owner: undefined,
			repo: undefined,
		});
	});

	it('should return proper response when url does only have owner', async () => {
		const response = getRepoInfoFromURL('http://example.com/Somebody');
		expect(response).toMatchObject({
			owner: 'Somebody',
			repo: undefined,
		});
	});

	it('should return proper response when url is empty string', async () => {
		const response = getRepoInfoFromURL('');
		expect(response).toMatchObject({
			owner: undefined,
			repo: undefined,
		});
	});

	it('should return proper response when url is undefined', async () => {
		const response = getRepoInfoFromURL(undefined);
		expect(response).toMatchObject({
			owner: undefined,
			repo: undefined,
		});
	});

	it('should return proper response when url is null', async () => {
		const response = getRepoInfoFromURL(null);
		expect(response).toMatchObject({
			owner: undefined,
			repo: undefined,
		});
	});
});

describe('Test getUniqueNetworkAppDirPairs method', () => {
	it('should return unique pairs when files has duplicate', async () => {
		const response = await getUniqueNetworkAppDirPairs([
			'mainnet/dir1',
			'devnet/dir2/some/text',
			'mainnet/dir1/extra/text',
		]);
		expect(response).toEqual([
			{
				network: 'mainnet',
				appDirName: 'dir1',
			},
			{
				network: 'devnet',
				appDirName: 'dir2',
			},
		]);
	});

	it('should return proper response when files are unique', async () => {
		const response = await getUniqueNetworkAppDirPairs([
			'devnet/dir2',
			'mainnet/dir1/extra/text',
		]);
		expect(response).toEqual([
			{
				network: 'devnet',
				appDirName: 'dir2',
			},
			{
				network: 'mainnet',
				appDirName: 'dir1',
			},
		]);
	});

	it('should return empty response when files is empty array', async () => {
		const response = await getUniqueNetworkAppDirPairs([]);
		expect(response).toEqual([]);
	});

	it('should return empty response when files is null', async () => {
		const response = await getUniqueNetworkAppDirPairs(null);
		expect(response).toEqual([]);
	});

	it('should return empty response when files is undefined', async () => {
		const response = await getUniqueNetworkAppDirPairs(undefined);
		expect(response).toEqual([]);
	});
});

describe('Test filterMetaConfigFilesByNetwork method', () => {
	it('should return filtered files by network when files has many networks', async () => {
		const mainnetFiles = [
			`mainnet/dir1/extra/${config.FILENAME.APP_JSON}`,
			`mainnet/dir1/extra/${config.FILENAME.NATIVETOKENS_JSON}`,
		];
		const files = [
			'mainnet/dir1/filename.txt',
			'devnet/dir2/some/text.txt',
			...mainnetFiles,
			'devnet/dir2/some/text.txt',
			`devnet/dir1/extra/${config.FILENAME.APP_JSON}`,
		];
		const response = await filterMetaConfigFilesByNetwork('mainnet', files);
		expect(response).toEqual(mainnetFiles);
	});

	it('should return empty array when files is empty', async () => {
		const response = await filterMetaConfigFilesByNetwork('mainnet', []);
		expect(response).toEqual([]);
	});

	it('should return empty array when files is null', async () => {
		const response = await filterMetaConfigFilesByNetwork('mainnet', null);
		expect(response).toEqual([]);
	});

	it('should return empty array when files is undefined', async () => {
		const response = await filterMetaConfigFilesByNetwork('mainnet', undefined);
		expect(response).toEqual([]);
	});

	it('should return empty array when network is undefined', async () => {
		const response = await filterMetaConfigFilesByNetwork(undefined, []);
		expect(response).toEqual([]);
	});

	it('should return empty array when network is null', async () => {
		const response = await filterMetaConfigFilesByNetwork(null, []);
		expect(response).toEqual([]);
	});

	it('should return empty array when network and files are undefined', async () => {
		const response = await filterMetaConfigFilesByNetwork(undefined, undefined);
		expect(response).toEqual([]);
	});

	it('should return empty array when network and files are null', async () => {
		const response = await filterMetaConfigFilesByNetwork(null, null);
		expect(response).toEqual([]);
	});
});

describe('Test getModifiedFileNames method', () => {
	it('should return flattened list of filenames when called with valid groupedFiles', async () => {
		const response = getModifiedFileNames(getModifiedFileNamesInput);
		expect(response).toEqual(getModifiedFileNamesExpectedResponse);
	});

	it('should return empty array when called with empty array or object', async () => {
		expect(getModifiedFileNames([])).toEqual([]);
		expect(getModifiedFileNames({})).toEqual([]);
	});

	it('should throw error when called with null or undefined groupedFiles', async () => {
		expect(() => getModifiedFileNames(null)).toThrow();
		expect(() => getModifiedFileNames(undefined)).toThrow();
	});
});
