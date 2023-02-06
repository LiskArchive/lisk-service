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
const { getRepoInfoFromURL, getUniqueNetworkAppDirPairs, filterMetaConfigFilesByNetwork } = require('../../shared/utils/downloadRepository');
const config = require('../../config');

describe('Test getRepoInfoFromURL method', () => {
	it('Returns proper response when url is valid', async () => {
		const response = getRepoInfoFromURL(config.gitHub.appRegistryRepo);
		expect(response).toMatchObject({
			owner: 'LiskHQ',
			repo: 'app-registry',
		});
	});

	it('Returns proper response when url does not have owner or repo', async () => {
		const response = getRepoInfoFromURL('http://example.com');
		expect(response).toMatchObject({
			owner: undefined,
			repo: undefined,
		});
	});

	it('Returns proper response when url does only have owner', async () => {
		const response = getRepoInfoFromURL('http://example.com/Somebody');
		expect(response).toMatchObject({
			owner: 'Somebody',
			repo: undefined,
		});
	});

	it('Returns proper response when url is empty string', async () => {
		const response = getRepoInfoFromURL('');
		expect(response).toMatchObject({
			owner: undefined,
			repo: undefined,
		});
	});

	it('Returns proper response when url is undefined', async () => {
		const response = getRepoInfoFromURL();
		expect(response).toMatchObject({
			owner: undefined,
			repo: undefined,
		});
	});
});

describe('Test getUniqueNetworkAppDirPairs method', () => {
	it('Returns unique pairs when files has duplicate', async () => {
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

	it('Returns proper response when files are unique', async () => {
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

	it('Returns empty response when files is empty array', async () => {
		const response = await getUniqueNetworkAppDirPairs([]);
		expect(response).toEqual([]);
	});

	it('Returns empty response when files is null', async () => {
		const response = await getUniqueNetworkAppDirPairs(null);
		expect(response).toEqual([]);
	});

	it('Returns empty response when files is undefined', async () => {
		const response = await getUniqueNetworkAppDirPairs(undefined);
		expect(response).toEqual([]);
	});
});

describe('Test filterMetaConfigFilesByNetwork method', () => {
	it('Returns filtered files by network when files has many networks', async () => {
		const files = [
			'mainnet/dir1/filename.txt',
			'devnet/dir2/some/text.txt',
			`mainnet/dir1/extra/${config.FILENAME.APP_JSON}`,
			`mainnet/dir1/extra/${config.FILENAME.NATIVETOKENS_JSON}`,
			'devnet/dir2/some/text.txt',
			`devnet/dir1/extra/${config.FILENAME.APP_JSON}`,
		];
		const response = await filterMetaConfigFilesByNetwork('mainnet', files);
		expect(response).toEqual([
			`mainnet/dir1/extra/${config.FILENAME.APP_JSON}`,
			`mainnet/dir1/extra/${config.FILENAME.NATIVETOKENS_JSON}`,
		]);
	});

	it('Returns empty array when files is empty', async () => {
		const files = [];
		const response = await filterMetaConfigFilesByNetwork('mainnet', files);
		expect(response).toEqual([]);
	});

	it('Returns empty array when files is null', async () => {
		const response = await filterMetaConfigFilesByNetwork('mainnet', null);
		expect(response).toEqual([]);
	});

	it('Returns empty array when files is undefined', async () => {
		const response = await filterMetaConfigFilesByNetwork('mainnet', undefined);
		expect(response).toEqual([]);
	});

	it('Returns empty array when network is undefined', async () => {
		const response = await filterMetaConfigFilesByNetwork(undefined, []);
		expect(response).toEqual([]);
	});

	it('Returns empty array when network is null', async () => {
		const response = await filterMetaConfigFilesByNetwork(null, []);
		expect(response).toEqual([]);
	});

	it('Returns empty array when network and files are undefined', async () => {
		const response = await filterMetaConfigFilesByNetwork();
		expect(response).toEqual([]);
	});
});
