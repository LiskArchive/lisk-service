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
const { getRepoInfoFromURL } = require('../../shared/utils/downloadRepository');
const config = require('../../config');

describe('test getRepoInfoFromURL method', () => {
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
		const response = getRepoInfoFromURL();
		expect(response).toMatchObject({
			owner: undefined,
			repo: undefined,
		});
	});
});
