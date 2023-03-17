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

const path = require('path');
const {
	getRepoDownloadURL,
	getLatestCommitHash,
	getCommitInfo,
	getFileDownloadURL,
	getDiff,
	buildEventPayload,
	syncWithRemoteRepo,
	downloadRepositoryToFS,
} = require('../../../../shared/utils/downloadRepository');

const keyValueTable = require('../../../../shared/database/mysqlKVStore');
const { KV_STORE_KEY } = require('../../../../shared/constants');
const config = require('../../../../config');
const { exists, rmdir } = require('../../../../shared/utils/fsUtils');

const commitHashRegex = /^[a-f0-9]{40}$/;
const enevtiAppFilePath = path.resolve(`${config.dataDir}/app-registry/devnet/Enevti/app.json`);

describe('Test getLatestCommitHash method', () => {
	it('should return correct latest commit hash info', async () => {
		const response = await getLatestCommitHash();
		expect(typeof response).toEqual('string');
		expect(response).toMatch(commitHashRegex);
	});
});

describe('Test getCommitInfo method', () => {
	const lastSyncedCommitHash = 'ec938b74bcb8208c95d8e4edc8c8a0961d1aaaaa';
	beforeAll(async () => keyValueTable.set(
		KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC,
		lastSyncedCommitHash,
	));
	afterAll(async () => keyValueTable.delete(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC));

	it('should return correct commit info', async () => {
		const response = await getCommitInfo();
		expect(Object.keys(response)).toEqual(['lastSyncedCommitHash', 'latestCommitHash']);
		expect(response.lastSyncedCommitHash).toEqual(lastSyncedCommitHash);
		expect(response.latestCommitHash).toMatch(commitHashRegex);
	});
});

describe('Test getRepoDownloadURL method', () => {
	it('should return correct repository download url info', async () => {
		const repoUrlRegex = /^https:\/\/\w*.github.com\/LiskHQ\/app-registry\/legacy.tar.gz\/refs\/heads\/main\?token=\w*$/;
		const response = await getRepoDownloadURL();
		expect(response.url).toMatch(repoUrlRegex);
	});
});

describe('Test getFileDownloadURL method', () => {
	it('should return correct file download info when file is valid', async () => {
		/* eslint-disable-next-line no-useless-escape */
		const fileUrlRegex = new RegExp(`^https:\/\/\\w*.github.com\/repos\/LiskHQ\/${config.gitHub.appRegistryRepoName}\/contents\/devnet\/Enevti\/nativetokens.json\\?owner=LiskHQ&repo=${config.gitHub.appRegistryRepoName}&ref=${config.gitHub.branch}$`);
		const response = await getFileDownloadURL('devnet/Enevti/nativetokens.json');
		expect(response.url).toMatch(fileUrlRegex);
	});

	it('should throw error when file is invalid', async () => {
		expect(async () => getFileDownloadURL('devnet/Enevti/invalid_file')).rejects.toThrow();
	});

	it('should throw error when file is undefined', async () => {
		expect(async () => getFileDownloadURL(undefined)).rejects.toThrow();
	});

	it('should throw error when file is null', async () => {
		expect(async () => getFileDownloadURL(null)).rejects.toThrow();
	});
});

describe('Test getDiff method', () => {
	it('should return list of file differences between two commits when commits are valid', async () => {
		const response = await getDiff('838464896420410dcbade293980fe42ca95931d0', '5ca021f84cdcdb3b28d3766cf675d942887327c3');
		const fileNames = response.data.files.map(file => file.filename);
		expect(fileNames).toEqual([
			'alphanet/Lisk/nativetokens.json',
			'betanet/Lisk/nativetokens.json',
			'devnet/Lisk/nativetokens.json',
		]);
	});

	it('should throw error when both commits are invalid', async () => {
		expect(() => getDiff('aaaa64896420410dcbade293980fe42ca95931d0', 'bbbb21f84cdcdb3b28d3766cf675d942887327c3')).rejects.toThrow();
	});

	it('should throw error when lastSyncedCommitHash is invalid', async () => {
		expect(() => getDiff('aaaa64896420410dcbade293980fe42ca95931d0', '5ca021f84cdcdb3b28d3766cf675d942887327c3')).rejects.toThrow();
	});

	it('should throw error when both latestCommitHash is invalid', async () => {
		expect(() => getDiff('838464896420410dcbade293980fe42ca95931d0', 'bbbb21f84cdcdb3b28d3766cf675d942887327c3')).rejects.toThrow();
	});

	it('should throw error when one or both commits are undefined', async () => {
		expect(() => getDiff('838464896420410dcbade293980fe42ca95931d0', undefined)).rejects.toThrow();
		expect(() => getDiff(undefined, '5ca021f84cdcdb3b28d3766cf675d942887327c3')).rejects.toThrow();
		expect(() => getDiff(undefined, undefined)).rejects.toThrow();
	});

	it('should throw error when one or both commits are null', async () => {
		expect(() => getDiff('838464896420410dcbade293980fe42ca95931d0', null)).rejects.toThrow();
		expect(() => getDiff(null, '5ca021f84cdcdb3b28d3766cf675d942887327c3')).rejects.toThrow();
		expect(() => getDiff(null, null)).rejects.toThrow();
	});
});

describe('Test buildEventPayload method', () => {
	it('should return event payload when called with a list of changed files', async () => {
		const changedFiles = [
			'alphanet/Lisk/nativetokens.json',
			'betanet/Lisk/nativetokens.json',
			'devnet/Lisk/nativetokens.json',
			'Unknown/Lisk/nativetokens.json',
			'alphanet/Enevti/nativetokens.json',
		];
		const response = await buildEventPayload(changedFiles);
		expect(response).toEqual({
			alphanet: ['Lisk', 'Enevti'],
			betanet: ['Lisk'],
			devnet: ['Lisk'],
			mainnet: [],
			testnet: [],
		});
	});

	it('should return event payload when called with empty changed files', async () => {
		const response = await buildEventPayload([]);
		expect(response).toEqual({
			alphanet: [],
			betanet: [],
			devnet: [],
			mainnet: [],
			testnet: [],
		});
	});

	it('should return event payload when called with undefined changed files', async () => {
		const response = await buildEventPayload(undefined);
		expect(response).toEqual({
			alphanet: [],
			betanet: [],
			devnet: [],
			mainnet: [],
			testnet: [],
		});
	});

	it('should return event payload when called with null changed files', async () => {
		const response = await buildEventPayload(null);
		expect(response).toEqual({
			alphanet: [],
			betanet: [],
			devnet: [],
			mainnet: [],
			testnet: [],
		});
	});
});

describe('Test downloadRepositoryToFS method', () => {
	it('should download repository correctly for first time', async () => {
		await rmdir(config.dataDir);
		expect(await exists(enevtiAppFilePath)).toEqual(false);
		await downloadRepositoryToFS();
		expect(await exists(enevtiAppFilePath)).toEqual(true);
	});

	it('should update repository correctly when repository is already downloaded before', async () => {
		const lastSyncedCommitHash = 'dc94ddae2aa3a9534a760e9e1c0425b6dcda38e8';

		await rmdir(enevtiAppFilePath);
		expect(await exists(enevtiAppFilePath)).toEqual(false);
		await keyValueTable.set(
			KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC,
			lastSyncedCommitHash,
		);
		await downloadRepositoryToFS();
		expect(await exists(enevtiAppFilePath)).toEqual(true);
		await keyValueTable.delete(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC);
	});
});

describe('Test syncWithRemoteRepo method', () => {
	const lastSyncedCommitHash = 'dc94ddae2aa3a9534a760e9e1c0425b6dcda38e8';
	beforeAll(async () => {
		// Set last sync commit hash in db and remove existing file
		await keyValueTable.set(
			KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC,
			lastSyncedCommitHash,
		);
		await rmdir(enevtiAppFilePath);
	});
	afterAll(async () => keyValueTable.delete(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC));

	it('should sync repository upto latest commit', async () => {
		expect(await exists(enevtiAppFilePath)).toEqual(false);
		await syncWithRemoteRepo();
		expect(await exists(enevtiAppFilePath)).toEqual(true);
	});
});
