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

	xdescribe(`Generators API on baseUrl: ${baseUrl}`, () => {
		const endpoint = `${baseUrl}/api/v3`;
		const generatorEndpoint = `${endpoint}/generators?limit=103`;
		const blockEndpoint = `${endpoint}/blocks?limit=1`;
		const validatorEndpoint = `${endpoint}/pos/validators?limit=1`;

		it(`Comparing generatedBlocks against total blocks on ${baseUrl}`, async () => {
			console.info(`Server: ${baseUrl}`);
			const response = await api.get(generatorEndpoint);
			const validatorAddresses = response.data.map(({ address }) => address);

			for (let j = 0; j < validatorAddresses.length; j++) {
				/* eslint-disable no-await-in-loop */
				const n = validatorAddresses[j];
				const { meta: { total } } = await api.get(`${blockEndpoint}&generatorAddress=${n}`);
				const { data: [{ generatedBlocks }] } = await api.get(`${validatorEndpoint}&address=${n}`);
				try {
					expect(total).toEqual(generatedBlocks);
				} catch (e) {
					console.error(`Mismatch --> validator: ${n}, blockProduced: ${total}, generatedBlocks: ${generatedBlocks}`);
					// console.error(e);
					// throw e;
				}
				/* eslint-enable no-await-in-loop */
			}
		});
	});
}
