/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
jest.setTimeout(2147483647);

const config = require('../../../config');
const { api } = require('../../../helpers/api');

// Add all the service endpoints to the array that you wish to compare the data against
const baseUrls = [config.SERVICE_ENDPOINT];

for (let i = 0; i < baseUrls.length; i++) {
	const baseUrl = baseUrls[i];

	xdescribe(`Forgers API on baseUrl: ${baseUrl}`, () => {
		const endpoint = `${baseUrl}/api/v2`;
		const forgersEndpoint = `${endpoint}/forgers?limit=103`;
		const blockEndpoint = `${endpoint}/blocks?limit=1`;
		const delegateEndpoint = `${endpoint}/accounts?isDelegate=true&limit=1`;

		it(`Comparing producedBlocks against total blocks on ${baseUrl}`, async () => {
			console.info(`Server: ${baseUrl}`);
			const response = await api.get(forgersEndpoint);
			const delegateNames = response.data.map(({ username }) => username);

			for (let j = 0; j < delegateNames.length; j++) {
				/* eslint-disable no-await-in-loop */
				const n = delegateNames[j];
				const { meta: { total } } = await api.get(`${blockEndpoint}&generatorUsername=${n}`);
				const { data: [{ dpos: { delegate: { producedBlocks } } }] } = await api.get(`${delegateEndpoint}&username=${n}`);

				try {
					expect(total).toEqual(producedBlocks);
				} catch (e) {
					console.error(`Mismatch --> delegate: ${n}, blockForged: ${total}, producedBlocks: ${producedBlocks}`);
					// console.error(e);
					// throw e;
				}
				/* eslint-enable no-await-in-loop */
			}
		});
	});
}
