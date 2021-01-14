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
module.exports = {
	ip: 'ipAddress,string',
	httpPort: '=,number',
	wsPort: '=,number',
	os: '=,string',
	version: '=,string',
	state: '=,number',
	stateName: '=,string',
	height: '=,number',
	broadhash: '=,string',
	nonce: '=,string',
	hostname: '=,string',
	location: {
		city: 'location.city,string',
		countryCode: 'location.country_code,string',
		ip: 'location.ip,string',
		latitude: 'location.latitude,string',
		longitude: 'location.longitude,string',
		regionCode: 'location.region_code,string',
		regionName: 'location.region_name,string',
		timeZone: 'location.time_zone,string',
		zipCode: 'location.zip_code',
	},
};
