/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
import { readFileSync } from 'fs';

import api from '../helpers/api';
import config from './config';

const stagingUrl = config.SERVICE_STAGING;
const prodUrl = config.SERVICE_PROD;

const urls = readFileSync('./integration/api/http_staging_mainnet/routes.txt', 'utf8').split('\n');

/**
 * This test can be used to have an overview of the changes at the time of release.
 * Definitely not suitable for CI/CD. Some routes are updated very often so two
 * different endpoints can provide different results. Market prices are different
 * but their timestamps are different as well. Different nodes can present different
 * height, the final evaluation is up to the person doing tests. Assuming that
 * each release is affecting the API these tests will never pass. That does not
 * contradict its usefulness though.
 */
describe('Routes match staging server', () => {
	urls.forEach(url => {
		it(`${prodUrl}${url}`, async () => {
			const responses = await Promise.all([
				api.get(`${stagingUrl}${url}`),
				api.get(`${prodUrl}${url}`),
			]);

			expect(responses[1]).toEqual(responses[0]);
		});
	});
});
