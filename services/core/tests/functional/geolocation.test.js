/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const {
	requestData,
} = require('../../shared/geolocation');

const { geolocationObjects } = require('../constants/geolocation');

describe('Test geolocation data', () => {
	describe('Get geolocation data', () => {
		it('by IP (first time)', async () => {
			geolocationObjects.forEach(async geoData => {
				await requestData(geoData.ip);
				expect(true).toEqual(true); // it should just recieve the data
			});
		});

		it('by IP (cached)', async () => {
			geolocationObjects.forEach(async geoData => {
				const geoResult = await requestData(geoData.ip);
				expect(geoResult).toEqual(geoData);
			});
		});
	});
});
