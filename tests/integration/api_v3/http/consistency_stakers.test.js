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
const baseUrls = [config.SERVICE_ENDPOINT, config.SERVICE_ENDPOINT];

for (let i = 1; i < baseUrls.length; i++) {
	const baseUrl0 = baseUrls[0];
	const baseUrl1 = baseUrls[i];

	xdescribe('Votes Received', () => {
		const endpoint0 = `${baseUrl0}/api/v3`;
		const endpoint1 = `${baseUrl1}/api/v3`;
		const generatorsEndpoint0 = `${endpoint0}/pos/validators?limit=103`;
		const stakersEndpoint0 = `${endpoint0}/pos/stakers`;
		const stakersEndpoint1 = `${endpoint1}/pos/stakers`;

		it(`Comparing data on ${baseUrl0} against ${baseUrl1}`, async () => {
			console.info(`Server: ${baseUrl0} against ${baseUrl1}`);
			const response = await api.get(generatorsEndpoint0);
			const validatorsNames = response.data.map(({ name }) => name);

			for (let j = 0; j < validatorsNames.length; j++) {
				/* eslint-disable no-await-in-loop */
				const name = validatorsNames[j];

				const { meta: { total: total0 } } = await api.get(`${stakersEndpoint0}?limit=1&name=${name}`);
				const { meta: { total: total1 } } = await api.get(`${stakersEndpoint1}?limit=1&name=${name}`);

				try {
					expect(total0).toBe(total1);
				} catch (e) {
					console.error(`Total mismatch for validator: ${name}, ${total0}, ${total1}`);
					// console.error(e);
					// throw e;
				}

				const votes0 = [];
				const votes1 = [];
				const limit = 100;

				for (let offset = 0; offset * limit < total0 + limit; offset++) {
					const result0 = await api.get(`${stakersEndpoint0}?offset=${offset * limit}&limit=${limit}&name=${name}`);
					const result1 = await api.get(`${stakersEndpoint1}?offset=${offset * limit}&limit=${limit}&name=${name}`);

					votes0.push(result0.data);
					votes1.push(result1.data);
				}

				try {
					expect(votes0.flat()).toEqual(votes1.flat());
				} catch (e) {
					console.error(`Stakes mismatch for validator: ${name}`);
					// console.error(e);
					// throw e;
				}
				/* eslint-enable no-await-in-loop */
			}
		});
	});
}
