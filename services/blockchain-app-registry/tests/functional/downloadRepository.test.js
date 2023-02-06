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
const { getRepoDownloadURL, getLatestCommitHash, getCommitInfo } = require('../../shared/utils/downloadRepository');
const keyValueTable = require('../../shared/database/mysqlKVStore');
const { KV_STORE_KEY } = require('../../shared/constants');

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
