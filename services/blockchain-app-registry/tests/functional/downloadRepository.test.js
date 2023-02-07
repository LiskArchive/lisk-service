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
} = require('../../shared/utils/downloadRepository');

const keyValueTable = require('../../shared/database/mysqlKVStore');
const { KV_STORE_KEY } = require('../../shared/constants');
const config = require('../../config');
const { exists, rmdir } = require('../../shared/utils/fsUtils');

describe('Test getLatestCommitHash method', () => {
	it('Returns correct latest commit hash info', async () => {
		const response = await getLatestCommitHash();
		expect(typeof response).toEqual('string');
		expect(response).toMatch(/^[a-f0-9]{40}$/);
	});
});

describe('Test getCommitInfo method', () => {
	const lastSyncedCommitHash = 'ec938b74bcb8208c95d8e4edc8c8a0961d1aaaaa';
	beforeAll(async () => keyValueTable.set(
		KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC,
		lastSyncedCommitHash,
	));
	afterAll(async () => keyValueTable.delete(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC));

	it('Returns correct commit hash info', async () => {
		const response = await getCommitInfo();
		expect(Object.keys(response)).toEqual(['lastSyncedCommitHash', 'latestCommitHash']);
		expect(response.lastSyncedCommitHash).toEqual(lastSyncedCommitHash);
		expect(response.latestCommitHash).toMatch(/^[a-f0-9]{40}$/);
	});
});

describe('Test getRepoDownloadURL method', () => {
	it('Returns correct repository download url', async () => {
		const response = await getRepoDownloadURL();
		expect(response.url).toMatch(/^https:\/\/\w*.github.com\/LiskHQ\/app-registry\/legacy.tar.gz\/refs\/heads\/main\?token=\w*$/);
	});
});

describe('Test getFileDownloadURL method', () => {
	it('Returns correct repository download info when file is valid', async () => {
		const response = await getFileDownloadURL('devnet/Enevti/nativetokens.json');
		/* eslint-disable-next-line no-useless-escape */
		expect(response.url).toMatch(new RegExp(`^https:\/\/\\w*.github.com\/repos\/LiskHQ\/${config.gitHub.appRegistryRepoName}\/contents\/devnet\/Enevti\/nativetokens.json\\?owner=LiskHQ&repo=${config.gitHub.appRegistryRepoName}&ref=${config.gitHub.branch}$`));
	});

	it('Throws error when file is invalid', async () => {
		expect(async () => getFileDownloadURL('devnet/Enevti/invalid_file')).rejects.toThrow();
	});

	it('Returns empty object when file is undefined', async () => {
		const response = await getFileDownloadURL();
		expect(response).toEqual({});
	});

	it('Returns empty object when file is null', async () => {
		const response = await getFileDownloadURL(null);
		expect(response).toEqual({});
	});
});

describe('Test getDiff method', () => {
	it('Returns list of file differences between two commits when commits are valid', async () => {
		const response = await getDiff('838464896420410dcbade293980fe42ca95931d0', '5ca021f84cdcdb3b28d3766cf675d942887327c3');
		const fileNames = response.data.files.map(file => file.filename);
		expect(fileNames).toEqual([
			'alphanet/Lisk/nativetokens.json',
			'betanet/Lisk/nativetokens.json',
			'devnet/Lisk/nativetokens.json',
		]);
	});
});

describe('Test buildEventPayload method', () => {
	it('Returns event payload when called with a list of changed files', async () => {
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

	it('Returns event payload when called with empty changed files', async () => {
		const response = await buildEventPayload([]);
		expect(response).toEqual({
			alphanet: [],
			betanet: [],
			devnet: [],
			mainnet: [],
			testnet: [],
		});
	});

	it('Returns event payload when called with undefined changed files', async () => {
		const response = await buildEventPayload(undefined);
		expect(response).toEqual({
			alphanet: [],
			betanet: [],
			devnet: [],
			mainnet: [],
			testnet: [],
		});
	});

	it('Returns event payload when called with null changed files', async () => {
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

describe('Test syncWithRemoteRepo method', () => {
	const lastSyncedCommitHash = 'dc94ddae2aa3a9534a760e9e1c0425b6dcda38e8';
	const enevtiAppJsonFilePath = path.resolve(`${__dirname}/../../data/app-registry/devnet/Enevti/app.json`);
	beforeAll(async () => {
		await keyValueTable.set(
			KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC,
			lastSyncedCommitHash,
		);
		await rmdir(enevtiAppJsonFilePath);
	});
	afterAll(async () => keyValueTable.delete(KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC));

	it('Sync repository with current state', async () => {
		await syncWithRemoteRepo();
		expect(await exists(enevtiAppJsonFilePath)).toEqual(true);
	});
});

describe('Test downloadRepositoryToFS method', () => {
	const lastSyncedCommitHash = 'dc94ddae2aa3a9534a760e9e1c0425b6dcda38e8';
	const enevtiAppJsonFilePath = path.resolve(`${__dirname}/../../data/app-registry/devnet/Enevti/app.json`);

	it('Downloads repository correctly for first time', async () => {
		await rmdir(config.dataDir);
		await downloadRepositoryToFS();
		expect(await exists(enevtiAppJsonFilePath)).toEqual(true);
	});

	it('Updates repository correctly when repository is already downloaded before', async () => {
		await rmdir(enevtiAppJsonFilePath);
		await keyValueTable.set(
			KV_STORE_KEY.COMMIT_HASH_UNTIL_LAST_SYNC,
			lastSyncedCommitHash,
		);
		await downloadRepositoryToFS();
		expect(await exists(enevtiAppJsonFilePath)).toEqual(true);
	});
});
